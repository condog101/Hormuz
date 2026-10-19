import Phaser from 'phaser';
import { DEPTH, PX } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Audio } from '../systems/Audio';

/**
 * Artillery shell: telegraphed by a reticle on the water, a shadow travels along the
 * ground track while the shell arcs above it and grows as it "falls" toward the camera.
 */
export class Shell {
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
    public tx: number,
    public ty: number,
    private flightMs: number,
  ) {
    this.reticle = game.add.sprite(tx, ty, 'reticle').setScale(PX).setDepth(DEPTH.shadow).play('reticle');
    this.shadow = game.add.image(x0, y0, 'shell_shadow').setScale(PX).setDepth(DEPTH.shadow).setAlpha(0.5);
    this.sprite = game.add.sprite(x0, y0, 'shell').setScale(PX).setDepth(DEPTH.air);
    this.arc = 90 + Math.hypot(tx - x0, ty - y0) * 0.35;
    if (Math.random() < 0.5) Audio.play('whistle', { minGapMs: 400, volume: 0.6 });
  }

  step(dt: number, dx: number) {
    this.x0 -= dx;
    this.tx -= dx;
    this.t += (dt * 1000) / this.flightMs;
    const t = Math.min(1, this.t);
    const gx = Phaser.Math.Linear(this.x0, this.tx, t);
    const gy = Phaser.Math.Linear(this.y0, this.ty, t);
    const h = Math.sin(Math.PI * t) * this.arc;
    this.shadow.setPosition(gx, gy).setScale(PX * (0.6 + 0.6 * t));
    this.sprite.setPosition(gx, gy - h).setScale(PX * (1 + Math.sin(Math.PI * t) * 1.2));
    this.reticle.setPosition(this.tx, this.ty);
    if (t >= 1) {
      this.done = true;
      this.destroy();
      this.game.shellLanded(this.tx, this.ty);
    }
  }

  destroy() {
    this.sprite.destroy();
    this.shadow.destroy();
    this.reticle.destroy();
  }
}
