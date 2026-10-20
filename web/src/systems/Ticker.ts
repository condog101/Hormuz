import Phaser from 'phaser';
import { DEPTH, HEIGHT, POPUP, WIDTH } from '../data/balance';
import { pickQuote, renderLine, type QuoteTag } from '../data/quotes';
import { Audio } from './Audio';
import { TOUCH } from './Device';
import { rand } from './Random';
import { COLORS, FONT } from './UI';

// Phones leave the bottom-left to the arrow pad and use bigger text.
const BAR_H = TOUCH ? 32 : 24;
const BAR_X = TOUCH ? 172 : 0;
const BAR_Y = HEIGHT - BAR_H;
const TAG_W = TOUCH ? 166 : 104;
const TEXT_PX = TOUCH ? 14 : 8;
/** Scroll speed, px/s. */
const SPEED = TOUCH ? 150 : 110;
const RED = 0xc8102e;

/**
 * "DON LIVE": Big Don's running commentary as a news ticker along the bottom edge, over the land.
 * Only story moments (guests, story calls) get the slide-in card; everything else scrolls past here.
 */
export class Ticker {
  private parts: Phaser.GameObjects.GameObject[];
  private line: Phaser.GameObjects.Text;
  private busy = false;
  private pending: string | null = null;
  private nextRandom: number;
  private lastContext = -Infinity;
  private recent: string[] = [];

  constructor(private scene: Phaser.Scene) {
    const s = scene;
    const left = BAR_X + TAG_W;
    const bg = s.add.rectangle(BAR_X, BAR_Y, WIDTH - BAR_X, BAR_H, 0x000000, 0.75).setOrigin(0);
    const rule = s.add.rectangle(BAR_X, BAR_Y, WIDTH - BAR_X, 1, 0xffd84a).setOrigin(0);
    const tag = s.add.rectangle(BAR_X, BAR_Y + 1, TAG_W, BAR_H - 1, RED).setOrigin(0);
    const tagText = s.add
      .text(BAR_X + TAG_W / 2, BAR_Y + BAR_H / 2 + 1, '● DON LIVE', { fontFamily: FONT, fontSize: `${TEXT_PX}px`, color: COLORS.text })
      .setOrigin(0.5);
    this.line = s.add
      .text(WIDTH, BAR_Y + BAR_H / 2 + 1, '', { fontFamily: FONT, fontSize: `${TEXT_PX}px`, color: COLORS.text })
      .setOrigin(0, 0.5);
    const clip = s.make.graphics({}, false).fillRect(left + 6, BAR_Y, WIDTH - left - 6, BAR_H);
    this.line.setMask(clip.createGeometryMask());
    this.parts = [bg, rule, tag, tagText, this.line];
    for (const p of this.parts) (p as Phaser.GameObjects.Text).setDepth(DEPTH.hud + 5).setAlpha(0);
    this.nextRandom = s.time.now + rand(POPUP.minGapMs * 0.5, POPUP.maxGapMs * 0.6);
  }

  /** Run a line for this tag. Respects a cooldown unless forced; a forced line queues behind the one scrolling. */
  trigger(tag: QuoteTag, force = false) {
    const now = this.scene.time.now;
    if (!force && (this.busy || now - this.lastContext < POPUP.contextCooldownMs)) return;
    this.lastContext = now;
    this.queue(tag);
  }

  private queue(tag: QuoteTag) {
    const q = pickQuote(tag, this.recent);
    this.recent = [q.text, ...this.recent].slice(0, 12);
    if (this.busy) this.pending = q.text;
    else this.start(q.text);
  }

  private start(text: string) {
    this.busy = true;
    this.line.setText(`BIG DON: ${renderLine(text)}`).setX(WIDTH);
    this.fade(1);
    Audio.play('blip', { volume: 0.25, pitch: 0.8 });
  }

  private fade(to: number) {
    this.scene.tweens.killTweensOf(this.parts);
    this.scene.tweens.add({ targets: this.parts, alpha: to, duration: 250 });
  }

  update(dtMs: number) {
    const now = this.scene.time.now;
    if (!this.busy) {
      if (now >= this.nextRandom) this.queue('random');
      return;
    }
    this.line.x -= (SPEED * dtMs) / 1000;
    if (this.line.x + this.line.width < BAR_X + TAG_W) {
      const next = this.pending;
      this.pending = null;
      if (next) this.start(next);
      else {
        this.busy = false;
        this.fade(0);
        this.nextRandom = now + rand(POPUP.minGapMs, POPUP.maxGapMs);
      }
    }
  }
}
