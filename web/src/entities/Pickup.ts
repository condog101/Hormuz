import { DEPTH } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Entity } from './Entity';

/** Damage-control crate floating in the current. */
export class Pickup extends Entity {
  private phase = 0;
  private baseY: number;

  constructor(game: GameScene, x: number, y: number) {
    super(game, x, y, 'pickup');
    this.play('pickup').setDepth(DEPTH.sea);
    this.baseY = y;
    this.radius = 16;
    this.shootable = false;
  }

  step(dt: number) {
    this.phase += dt * 3;
    this.y = this.baseY + Math.sin(this.phase) * 2;
    if (this.x < -30) this.remove();
  }
}
