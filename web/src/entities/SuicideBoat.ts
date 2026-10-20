import Phaser from 'phaser';
import { DAMAGE, DEPTH } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Entity } from './Entity';

/** Fast attack boat that homes on the destroyer and detonates on contact. */
export class SuicideBoat extends Entity {
  private heading: number;
  private zigPhase = Math.random() * Math.PI * 2;
  private wake: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    game: GameScene,
    x: number,
    y: number,
    heading: number,
    private speed: number,
    private zig: boolean,
  ) {
    super(game, x, y, zig ? 'boat_b' : 'boat_a');
    this.play(zig ? 'boat_b' : 'boat_a').setDepth(DEPTH.sea);
    this.heading = heading;
    this.radius = 12;
    this.scrolls = false;
    this.contactDamage = DAMAGE.boat;
    this.kind = zig ? 'boatZig' : 'boat';
    this.wake = game.add.particles(0, 0, 'px', {
      lifespan: 500,
      speed: { min: 5, max: 20 },
      scale: { start: 1.5, end: 0.3 },
      alpha: { start: 0.6, end: 0 },
      frequency: 45,
    });
    this.wake.setDepth(DEPTH.sea - 1);
  }

  step(dt: number) {
    const p = this.game_.player;
    const desired = Phaser.Math.Angle.Between(this.x, this.y, p.x, p.y);
    const turn = (this.zig ? 2.2 : 1.6) * dt;
    this.heading = Phaser.Math.Angle.RotateTo(this.heading, desired, turn);
    let h = this.heading;
    if (this.zig) {
      this.zigPhase += dt * 5;
      h += Math.sin(this.zigPhase) * 0.7;
    }
    this.x += Math.cos(h) * this.speed * dt - this.game_.scrollSpeed * dt * 0.3;
    this.y += Math.sin(h) * this.speed * dt;
    const [top, bot] = this.game_.coast.waterBand(this.x - 8, this.x + 8);
    if (this.y > top + 6 && this.y < bot - 6) {
      // Once at sea, stay at sea.
      this.y = Phaser.Math.Clamp(this.y, top + 10, bot - 10);
    }
    this.setRotation(h);
    this.wake.setPosition(this.x - Math.cos(h) * 14, this.y - Math.sin(h) * 14);
    if (this.x < -120) this.remove();
  }

  destroy(fromScene?: boolean) {
    this.wake?.destroy();
    super.destroy(fromScene);
  }
}
