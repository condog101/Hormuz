import Phaser from 'phaser';
import { DEPTH, PX } from '../data/balance';
import { Save } from './Save';

/** One-shot visual effects. Everything spawned here scrolls with the world if asked. */
export class Fx {
  private scrolling: Phaser.GameObjects.GameObject[] = [];

  constructor(private scene: Phaser.Scene) {}

  private oneShot(key: string, anim: string, x: number, y: number, depth: number, scale = PX, scroll = true) {
    const s = this.scene.add.sprite(x, y, key).setScale(scale).setDepth(depth);
    s.play(anim);
    s.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => s.destroy());
    if (scroll) this.scrolling.push(s);
    return s;
  }

  explosion(x: number, y: number, big = false) {
    this.oneShot(big ? 'explosion_lg' : 'explosion_sm', big ? 'explosion_lg' : 'explosion_sm', x, y, DEPTH.fx);
    for (let i = 0; i < (big ? 4 : 2); i++) {
      this.scene.time.delayedCall(120 + i * 90, () =>
        this.smoke(x + Phaser.Math.Between(-10, 10), y + Phaser.Math.Between(-8, 8)),
      );
    }
  }

  splash(x: number, y: number) {
    this.oneShot('splash', 'splash', x, y, DEPTH.sea);
  }

  smoke(x: number, y: number) {
    const s = this.oneShot('smoke', 'smoke', x, y, DEPTH.fx - 1);
    this.scene.tweens.add({ targets: s, y: y - 14, duration: 500 });
  }

  floatText(x: number, y: number, text: string, color = '#ffe14d') {
    const t = this.scene.add
      .text(x, y, text, { fontFamily: '"Press Start 2P"', fontSize: '8px', color })
      .setOrigin(0.5)
      .setStroke('#000', 3)
      .setDepth(DEPTH.fx + 1);
    this.scene.tweens.add({ targets: t, y: y - 28, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  }

  shake(intensity = 0.006, ms = 160) {
    if (Save.progress.settings.shake) this.scene.cameras.main.shake(ms, intensity);
  }

  tracer(x0: number, y0: number, x1: number, y1: number) {
    const g = this.scene.add.graphics().setDepth(DEPTH.fx);
    g.lineStyle(2, 0xfff3a0, 1).lineBetween(x0, y0, x1, y1);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 120, onComplete: () => g.destroy() });
  }

  /** Move scroll-locked effects with the world. */
  update(dx: number) {
    this.scrolling = this.scrolling.filter((o) => o.active);
    for (const o of this.scrolling) (o as Phaser.GameObjects.Sprite).x -= dx;
  }
}
