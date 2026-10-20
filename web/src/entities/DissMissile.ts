import Phaser from 'phaser';
import { DEPTH, DISS, PX } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Audio } from '../systems/Audio';
import { Entity } from './Entity';

const GOLD = 0xffd84a;

/**
 * DISS TRACKS: a friendly guided missile. Locks one opp (gold reticle on it), curls round to hit it,
 * and picks the next nearest opp if its target dies first.
 */
export class DissMissile extends Entity {
  private speed = 120;
  private age = 0;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;
  private reticle: Phaser.GameObjects.Sprite;

  constructor(
    game: GameScene,
    x: number,
    y: number,
    angle: number,
    private target: Entity | null,
  ) {
    super(game, x, y, 'missile');
    this.play('missile').setDepth(DEPTH.air).setRotation(angle).setTint(GOLD);
    this.scrolls = false;
    this.shootable = false;
    this.contactDamage = 0;
    this.kind = null;
    this.trail = game.add.particles(0, 0, 'px', {
      lifespan: 380,
      speed: { min: 2, max: 10 },
      scale: { start: 2, end: 0.5 },
      alpha: { start: 0.7, end: 0 },
      tint: [GOLD, 0xb26bff, 0xd6aaff],
      frequency: 14,
    });
    this.trail.setDepth(DEPTH.air - 1);
    this.reticle = game.add.sprite(x, y, 'reticle').setScale(PX).setDepth(DEPTH.fx).setTintFill(GOLD).play('reticle');
    this.reticle.setVisible(!!target);
  }

  step(dt: number) {
    this.age += dt;
    if (!this.target || this.target.dead || !this.target.active) {
      this.target = this.game_.nearestEnemies(this.x, this.y, 1, DISS.range)[0] ?? null;
    }
    this.speed = Math.min(DISS.speed, this.speed + DISS.accel * dt);
    const t = this.target;
    if (t) {
      const a = Phaser.Math.Angle.Between(this.x, this.y, t.x, t.y);
      this.setRotation(Phaser.Math.Angle.RotateTo(this.rotation, a, DISS.turnRate * dt));
      this.reticle.setPosition(t.x, t.y).setVisible(true);
    } else this.reticle.setVisible(false);
    this.x += Math.cos(this.rotation) * this.speed * dt;
    this.y += Math.sin(this.rotation) * this.speed * dt;
    this.trail.setPosition(this.x - Math.cos(this.rotation) * 14, this.y - Math.sin(this.rotation) * 14);
    if (t && Math.hypot(t.x - this.x, t.y - this.y) < t.radius + 6) {
      const g = this.game_;
      g.fx.explosion(this.x, this.y);
      Audio.play('boom', { minGapMs: 40 });
      g.areaDamage(this.x, this.y, DISS.blastRadius, DISS.damage);
      this.remove();
      return;
    }
    if (this.age > DISS.ttlS || this.offscreen(60)) {
      this.game_.fx.explosion(this.x, this.y);
      this.remove();
    }
  }

  destroy(fromScene?: boolean) {
    this.trail?.destroy();
    this.reticle?.destroy();
    super.destroy(fromScene);
  }
}
