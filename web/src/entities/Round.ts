import { DEPTH, PX } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Entity } from './Entity';

export interface RoundOpts {
  speed: number;
  damage: number;
  /** Expire after this many seconds (short-range pellets). */
  ttlS?: number;
  tint?: number;
  scale?: number;
}

/** Friendly round. Flies flat until it hits something, runs out of range or leaves the screen. */
export class Round extends Entity {
  /** Damage per hit (`damage()` is the Entity method for taking hits). */
  readonly power: number;
  private vx: number;
  private vy: number;
  private ttl: number;

  constructor(game: GameScene, x: number, y: number, angle: number, opts: RoundOpts) {
    super(game, x, y, 'round');
    this.setRotation(angle).setDepth(DEPTH.air - 1);
    if (opts.tint !== undefined) this.setTint(opts.tint);
    if (opts.scale !== undefined) this.setScale(PX * opts.scale);
    this.vx = Math.cos(angle) * opts.speed;
    this.vy = Math.sin(angle) * opts.speed;
    this.power = opts.damage;
    this.ttl = opts.ttlS ?? Infinity;
    this.scrolls = false;
    this.radius = 4;
  }

  step(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0 || this.offscreen(10)) this.remove();
  }
}
