import { DEPTH, PX } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Entity } from './Entity';

/** Straight-flying hostile round (boss deck gun, drive-by bursts). */
export class HostileBullet extends Entity {
  constructor(game: GameScene, x: number, y: number, private vx: number, private vy: number, damage: number, tint: number) {
    super(game, x, y, 'shell');
    this.setDepth(DEPTH.air).setTintFill(tint).setScale(PX * 1.5);
    this.radius = 5;
    this.scrolls = false;
    this.shootable = false;
    this.contactDamage = damage;
  }

  step(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.offscreen(20)) this.remove();
  }
}
