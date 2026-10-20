import Phaser from 'phaser';
import { DAMAGE, DEPTH, PX } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Entity } from './Entity';

/** Slow kamikaze drone that dives in from the north. Its shadow shows where it is. */
export class Drone extends Entity {
  private shadow: Phaser.GameObjects.Image;
  private speed = 95;

  constructor(game: GameScene, x: number, y: number) {
    super(game, x, y, 'drone');
    this.play('drone').setDepth(DEPTH.air);
    this.radius = 14;
    this.scrolls = false;
    this.contactDamage = DAMAGE.drone;
    this.kind = 'drone';
    this.shadow = game.add.image(x, y, 'drone', 0).setScale(PX).setTintFill(0x000000).setAlpha(0.25).setDepth(DEPTH.shadow);
  }

  step(dt: number) {
    const p = this.game_.player;
    const a = Phaser.Math.Angle.Between(this.x, this.y, p.x, p.y);
    const h = Phaser.Math.Angle.RotateTo(this.rotation, a, 1.2 * dt);
    this.setRotation(h);
    this.x += Math.cos(h) * this.speed * dt;
    this.y += Math.sin(h) * this.speed * dt;
    this.shadow.setPosition(this.x + 10, this.y + 22).setRotation(h);
    if (this.offscreen(120)) this.remove();
  }

  destroy(fromScene?: boolean) {
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}
