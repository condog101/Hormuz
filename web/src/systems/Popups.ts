import Phaser from 'phaser';
import { DEPTH, POPUP, WIDTH } from '../data/balance';
import { pickQuote, type QuoteTag } from '../data/quotes';
import { Audio } from './Audio';
import { rand } from './Random';
import { COLORS, FONT, panel, text } from './UI';

const W = 440;
const H = 156;

/**
 * "INCOMING - COMMANDER IN CHIEF": a portrait slides in and types out a line.
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

  constructor(private scene: Phaser.Scene) {
    const s = scene;
    this.root = s.add.container(WIDTH + 10, 8).setDepth(DEPTH.popup);
    this.root.add(panel(s, 0, 0, W, H));
    this.banner = text(s, 14, 18, '● INCOMING - COMMANDER IN CHIEF', 8, COLORS.red, 0).setOrigin(0, 0.5);
    this.root.add(this.banner);
    this.root.add(s.add.rectangle(14, 30, 132, 116, 0x000000).setOrigin(0));
    this.portrait = s.add.sprite(16, 32, 'potus', 0).setOrigin(0).setScale(2);
    // crop to 64x56 so the portrait fits the frame
    this.portrait.setCrop(0, 0, 64, 56);
    this.root.add(this.portrait);
    this.body = s.add
      .text(158, 34, '', { fontFamily: FONT, fontSize: '8px', color: COLORS.text, lineSpacing: 6, wordWrap: { width: W - 172 } })
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

  private show(tag: QuoteTag) {
    const q = pickQuote(tag, this.recent);
    this.recent = [q.text, ...this.recent].slice(0, 12);
    this.busy = true;
    this.full = q.text;
    this.shown = 0;
    this.typeAcc = 0;
    this.body.setText('');
    this.typing = true;
    this.nextRandom = this.scene.time.now + rand(POPUP.minGapMs, POPUP.maxGapMs);
    Audio.play('incoming');
    this.scene.tweens.add({ targets: this.root, x: WIDTH - W - 8, duration: 350, ease: 'Back.easeOut' });
    this.scene.tweens.add({ targets: this.banner, alpha: 0.3, yoyo: true, repeat: 7, duration: 180 });
  }

  private hide() {
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
        if (this.shown % 3 === 0) Audio.play('blip', { volume: 0.25, pitch: 0.6 + Math.random() * 0.3, minGapMs: 20 });
      }
      this.body.setText(this.full.slice(0, this.shown));
      this.mouthAcc += dtMs;
      if (this.mouthAcc > 90) {
        this.mouthAcc = 0;
        const ch = this.full[this.shown - 1] ?? ' ';
        this.portrait.setFrame(/[\s.,!?]/.test(ch) ? 0 : Phaser.Math.Between(1, 2));
      }
      if (this.shown >= this.full.length) {
        this.typing = false;
        this.portrait.setFrame(0);
        this.scene.time.delayedCall(POPUP.holdMs, () => this.hide());
      }
    } else if (now > this.blinkAt) {
      this.blinkAt = now + rand(1500, 3000);
      this.portrait.setFrame(3);
      this.scene.time.delayedCall(120, () => this.portrait.setFrame(0));
    }
  }
}
