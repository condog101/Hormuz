import { DEPTH, PLAYER } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Entity } from './Entity';

/** Friendly 5-inch round. Flies flat until it hits something or leaves the screen. */
export class Round extends Entity {
  private vx: number;
  private vy: number;

  constructor(game: GameScene, x: number, y: number, angle: number) {
    super(game, x, y, 'round');
    this.setRotation(angle).setDepth(DEPTH.air - 1);
    this.vx = Math.cos(angle) * PLAYER.roundSpeed;
    this.vy = Math.sin(angle) * PLAYER.roundSpeed;
    this.scrolls = false;
    this.radius = 4;
  }

  step(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.offscreen(10)) this.remove();
  }
}
