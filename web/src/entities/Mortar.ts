import Phaser from 'phaser';
import { DEPTH, PX } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Audio } from '../systems/Audio';

const GOLD = 0xffd84a;

/**
 * THE 808: a friendly lob to the aim point. Mirrors Shell (shadow on the water, the round arcing
 * above it) but tinted gold, so its reticle never reads as an incoming enemy shell.
 */
export class Mortar {
  done = false;
  private t = 0;
  private sprite: Phaser.GameObjects.Sprite;
  private shadow: Phaser.GameObjects.Image;
  private reticle: Phaser.GameObjects.Sprite;
  private arc: number;

  constructor(
    private game: GameScene,
    private x0: number,
    private y0: number,
    private tx: number,
    private ty: number,
    private flightMs: number,
    private radius: number,
    private dmg: number,
  ) {
    this.reticle = game.add.sprite(tx, ty, 'reticle').setScale(PX).setDepth(DEPTH.shadow).setTintFill(GOLD).play('reticle');
    this.shadow = game.add.image(x0, y0, 'shell_shadow').setScale(PX).setDepth(DEPTH.shadow).setAlpha(0.5);
    this.sprite = game.add.sprite(x0, y0, 'shell').setScale(PX * 2).setDepth(DEPTH.air).setTintFill(GOLD);
    this.arc = 40 + Math.hypot(tx - x0, ty - y0) * 0.25;
  }

  step(dt: number, dx: number) {
    this.x0 -= dx;
    this.tx -= dx;
    this.t += (dt * 1000) / this.flightMs;
    const t = Math.min(1, this.t);
    const gx = Phaser.Math.Linear(this.x0, this.tx, t);
    const gy = Phaser.Math.Linear(this.y0, this.ty, t);
    const h = Math.sin(Math.PI * t) * this.arc;
    this.shadow.setPosition(gx, gy);
    this.sprite.setPosition(gx, gy - h).setScale(PX * 2 * (1 + Math.sin(Math.PI * t) * 0.6));
    this.reticle.setPosition(this.tx, this.ty);
    if (t >= 1) {
      this.done = true;
      this.destroy();
      const g = this.game;
      g.areaDamage(this.tx, this.ty, this.radius, this.dmg);
      g.fx.explosion(this.tx, this.ty, true);
      g.fx.shake(0.01, 220);
      Audio.play('bigBoom', { minGapMs: 80 });
    }
  }

  destroy() {
    this.sprite.destroy();
    this.shadow.destroy();
    this.reticle.destroy();
  }
}
