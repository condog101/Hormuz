import Phaser from 'phaser';
import { DEPTH, POPUP, WIDTH } from '../data/balance';
import { HYPE_TAGS, isBleeped, pickQuote, renderLine, type QuoteTag } from '../data/quotes';
import { Audio } from './Audio';
import { TOUCH } from './Device';
import { rand } from './Random';
import { COLORS, FONT, panel, text } from './UI';

// Phones get a wider card with bigger text, parked under the HUD and clear of the touch buttons.
const W = TOUCH ? 540 : 440;
const H = TOUCH ? 172 : 156;
const REST_X = TOUCH ? 316 : WIDTH - W - 8;
const REST_Y = TOUCH ? 88 : 8;
const BODY_PX = TOUCH ? 12 : 8;
/** Extra hold per character on touch, so a long line stays up long enough to read at arm's length. */
const HOLD_PER_CHAR_MS = TOUCH ? 22 : 0;

/** Who is on the line: portrait sheet, the frame they rest on and the frame they talk on. */
export interface Speaker {
  name: string;
  key: string;
  rest: number;
  talk: number;
}

export const DON: Speaker = { name: 'BIG DON', key: 'potus', rest: 0, talk: 1 };

/** A line as it was presented: who said it, the frame they rest on, the rendered text. */
export interface Shown {
  speaker: Speaker;
  frame: number;
  text: string;
}

/**
 * "INCOMING - BIG DON": a portrait slides in and types out a line.
 * The game keeps running underneath; the interruption is the joke.
 */
export class Popups {
  private root: Phaser.GameObjects.Container;
  private portrait: Phaser.GameObjects.Sprite;
  private body: Phaser.GameObjects.Text;
  private banner: Phaser.GameObjects.Text;
  private busy = false;
  private nextRandom: number;
  private lastContext = -Infinity;
  private recent: string[] = [];
  private typing = false;
  private full = '';
  private shown = 0;
  private typeAcc = 0;
  private mouthAcc = 0;
  private blinkAt = 0;
  /** Portrait frame Big Don rests on for the current line (0 default, 4 shades + grin). */
  private restFrame = 0;
  private speaker: Speaker = DON;
  private hideTimer: Phaser.Time.TimerEvent | null = null;
  private onDone: (() => void) | null = null;
  private last: Shown | null = null;
  private replyTimer: Phaser.Time.TimerEvent | null = null;

  constructor(private scene: Phaser.Scene) {
    const s = scene;
    this.root = s.add.container(WIDTH + 10, REST_Y).setDepth(DEPTH.popup);
    this.root.add(panel(s, 0, 0, W, H));
    this.banner = text(s, 14, 18, '● INCOMING - BIG DON', 8, COLORS.red, 0).setOrigin(0, 0.5);
    this.root.add(this.banner);
    this.root.add(s.add.rectangle(14, 30, 132, 116, 0x000000).setOrigin(0));
    this.portrait = s.add.sprite(16, 32, 'potus', 0).setOrigin(0).setScale(2);
    // crop to 64x56 so the portrait fits the frame
    this.portrait.setCrop(0, 0, 64, 56);
    this.root.add(this.portrait);
    this.body = s.add
      .text(158, 34, '', { fontFamily: FONT, fontSize: `${BODY_PX}px`, color: COLORS.text, lineSpacing: 6, wordWrap: { width: W - 172 } })
      .setOrigin(0);
    this.root.add(this.body);
    this.nextRandom = s.time.now + rand(POPUP.minGapMs * 0.5, POPUP.maxGapMs * 0.6);
  }

  /** Fire a contextual line (damage, boss, etc). Respects a cooldown unless forced. */
  trigger(tag: QuoteTag, force = false) {
    const now = this.scene.time.now;
    if (this.busy) return;
    if (!force && now - this.lastContext < POPUP.contextCooldownMs) return;
    this.lastContext = now;
    this.show(tag);
  }

  /**
   * A guest takes the line: cuts off whatever is showing and types `line` under a gold banner.
   * Big Don answers with `reply` `replyDelayMs` after they finish, unless another guest cuts in first.
   */
  say(speaker: Speaker, line: string, reply?: string, replyDelayMs = 6000) {
    this.cutOff();
    this.replyTimer?.remove();
    this.replyTimer = null;
    this.present(renderLine(line), speaker, speaker.rest);
    if (reply) {
      this.onDone = () => {
        this.replyTimer = this.scene.time.delayedCall(replyDelayMs, () => {
          this.replyTimer = null;
          this.sayDon(reply);
        });
      };
    }
  }

  /** A contextual line that cuts off whatever is showing (first use of something new). */
  interrupt(tag: QuoteTag) {
    this.cutOff();
    this.lastContext = this.scene.time.now;
    this.show(tag);
  }

  /** Big Don says a specific line (a reply to a guest), cutting off whatever is showing. */
  sayDon(line: string, hype = false) {
    this.cutOff();
    this.present(renderLine(line), DON, hype ? 4 : 0);
  }

  private cutOff() {
    this.hideTimer?.remove();
    this.scene.tweens.killTweensOf([this.root, this.banner]);
    this.banner.setAlpha(1);
  }

  /** The line on screen right now, or null when the card is away. */
  get current(): Shown | null {
    return this.busy ? this.last : null;
  }

  /** The most recent line, for the pause screen. */
  get lastLine(): Shown | null {
    return this.last;
  }

  /** Hide the card while the pause screen or the reader covers the game. */
  setHidden(on: boolean) {
    this.root.setVisible(!on);
  }

  /** True when the card is on screen and (x, y) is inside it. */
  hitTest(x: number, y: number): boolean {
    if (!this.busy || this.root.x >= WIDTH) return false;
    return x >= this.root.x && x <= this.root.x + W && y >= this.root.y && y <= this.root.y + H;
  }

  private show(tag: QuoteTag) {
    const q = pickQuote(tag, this.recent);
    this.recent = [q.text, ...this.recent].slice(0, 12);
    this.present(renderLine(q.text), DON, HYPE_TAGS.has(tag) ? 4 : 0);
  }

  private present(fullText: string, speaker: Speaker, restFrame: number) {
    this.busy = true;
    this.onDone = null;
    this.speaker = speaker;
    this.full = fullText;
    this.restFrame = restFrame;
    this.last = { speaker, frame: restFrame, text: fullText };
    this.portrait.setTexture(speaker.key, restFrame);
    if (speaker === DON) this.banner.setText('● INCOMING - BIG DON').setColor(COLORS.red);
    else this.banner.setText(`● GUEST FEATURE - ${speaker.name}`).setColor(COLORS.gold);
    this.shown = 0;
    this.typeAcc = 0;
    this.body.setText('');
    this.typing = true;
    this.nextRandom = this.scene.time.now + rand(POPUP.minGapMs, POPUP.maxGapMs);
    Audio.play('incoming');
    this.scene.tweens.add({ targets: this.root, x: REST_X, duration: 350, ease: 'Back.easeOut' });
    this.scene.tweens.add({ targets: this.banner, alpha: 0.3, yoyo: true, repeat: 7, duration: 180 });
  }

  private hide() {
    this.hideTimer = null;
    this.scene.tweens.add({
      targets: this.root,
      x: WIDTH + 10,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => (this.busy = false),
    });
  }

  update(dtMs: number) {
    const now = this.scene.time.now;
    if (!this.busy && now >= this.nextRandom) this.show('random');
    if (!this.busy) return;
    if (this.typing) {
      const msPerChar = POPUP.typeMs / Math.max(40, this.full.length);
      this.typeAcc += dtMs;
      while (this.typeAcc >= msPerChar && this.shown < this.full.length) {
        this.typeAcc -= msPerChar;
        this.shown++;
        if (isBleeped(this.full, this.shown - 1)) Audio.play('bleep', { volume: 0.6, minGapMs: 200 });
        else if (this.shown % 3 === 0) Audio.play('blip', { volume: 0.25, pitch: 0.6 + Math.random() * 0.3, minGapMs: 20 });
      }
      this.body.setText(this.full.slice(0, this.shown));
      this.mouthAcc += dtMs;
      if (this.mouthAcc > 90) {
        this.mouthAcc = 0;
        const ch = this.full[this.shown - 1] ?? ' ';
        const talk = this.speaker === DON ? Phaser.Math.Between(1, 2) : this.speaker.talk;
        this.portrait.setFrame(/[\s.,!?]/.test(ch) ? this.restFrame : talk);
      }
      if (this.shown >= this.full.length) {
        this.typing = false;
        this.portrait.setFrame(this.restFrame);
        this.hideTimer = this.scene.time.delayedCall(POPUP.holdMs + HOLD_PER_CHAR_MS * this.full.length, () => this.hide());
        const done = this.onDone;
        this.onDone = null;
        done?.();
      }
    } else if (this.speaker === DON && this.restFrame === 0 && now > this.blinkAt) {
      // no blinking behind the shades
      this.blinkAt = now + rand(1500, 3000);
      this.portrait.setFrame(3);
      this.scene.time.delayedCall(120, () => this.portrait.setFrame(this.restFrame));
    }
  }
}
