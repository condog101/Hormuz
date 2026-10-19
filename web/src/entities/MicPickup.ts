import { DEPTH } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Entity } from './Entity';

/** Golden studio mic floating in the current: collect it for a guest feature. */
export class MicPickup extends Entity {
  private phase = 0;
  private baseY: number;

  constructor(game: GameScene, x: number, y: number) {
    super(game, x, y, 'mic');
    this.play('mic').setDepth(DEPTH.sea);
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
