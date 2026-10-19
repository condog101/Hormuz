import Phaser from 'phaser';
import { DAMAGE, DEPTH } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Entity } from './Entity';

/** Shore-launched anti-ship missile. Fast, barely steers. CIWS it or get out of the way. */
export class Missile extends Entity {
  private speed = 60;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(game: GameScene, x: number, y: number, angle: number) {
    super(game, x, y, 'missile');
    this.play('missile').setDepth(DEPTH.air).setRotation(angle);
    this.radius = 9;
    this.scrolls = false;
    this.shootable = false;
    this.ciwsTarget = true;
    this.contactDamage = DAMAGE.missile;
    this.kind = 'missile';
    this.trail = game.add.particles(0, 0, 'px', {
      lifespan: 450,
      speed: { min: 2, max: 12 },
      scale: { start: 2, end: 0.5 },
      alpha: { start: 0.6, end: 0 },
      tint: [0xdddddd, 0xaaaaaa, 0xffaa33],
      frequency: 16,
    });
    this.trail.setDepth(DEPTH.air - 1);
  }

  step(dt: number) {
    this.speed = Math.min(330, this.speed + 520 * dt);
    const p = this.game_.player;
    const a = Phaser.Math.Angle.Between(this.x, this.y, p.x, p.y);
    this.setRotation(Phaser.Math.Angle.RotateTo(this.rotation, a, 0.35 * dt));
    this.x += Math.cos(this.rotation) * this.speed * dt;
    this.y += Math.sin(this.rotation) * this.speed * dt;
    this.trail.setPosition(this.x - Math.cos(this.rotation) * 14, this.y - Math.sin(this.rotation) * 14);
    if (this.offscreen(60)) this.remove();
  }

  destroy(fromScene?: boolean) {
    this.trail?.destroy();
    super.destroy(fromScene);
  }
}
