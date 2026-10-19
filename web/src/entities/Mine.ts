import { DAMAGE, DEPTH } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Entity } from './Entity';

export class Mine extends Entity {
  private phase = Math.random() * 6;
  private baseY: number;

  constructor(game: GameScene, x: number, y: number) {
    super(game, x, y, 'mine');
    this.play('mine').setDepth(DEPTH.sea);
    this.baseY = y;
    this.radius = 11;
    this.contactDamage = DAMAGE.mine;
    this.kind = 'mine';
  }

  step(dt: number) {
    this.phase += dt;
    this.baseY += Math.sin(this.phase * 0.4) * 6 * dt;
    this.y = this.baseY + Math.sin(this.phase * 2) * 2;
    if (this.x < -40) this.remove();
  }
}
