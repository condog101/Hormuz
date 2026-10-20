import Phaser from 'phaser';
import type { KillKind } from '../../../shared/scoring';
import { PX } from '../data/balance';
import type { GameScene } from '../scenes/Game';

/** Base for everything in the world that can be hit or updated. */
export abstract class Entity extends Phaser.GameObjects.Sprite {
  radius = 10;
  hp = 1;
  dead = false;
  /** Moves left with the water/land as the ship advances. */
  scrolls = true;
  /** Main-gun rounds can hit it. */
  shootable = true;
  /** Damages the player on contact (and dies). */
  contactDamage = 0;
  kind: KillKind | null = null;

  constructor(
    protected game_: GameScene,
    x: number,
    y: number,
    key: string,
    frame = 0,
  ) {
    super(game_, x, y, key, frame);
    this.setScale(PX);
    game_.add.existing(this);
  }

  abstract step(dt: number): void;

  /** Returns true if this hit killed it. */
  damage(n: number): boolean {
    if (this.dead) return false;
    this.hp -= n;
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    this.setTintFill(0xffffff);
    this.game_.time.delayedCall(60, () => this.active && this.clearTint());
    return false;
  }

  /** Called on kill. Default: explode and vanish. */
  die() {
    this.dead = true;
    this.game_.fx.explosion(this.x, this.y);
    this.destroy();
  }

  /** Remove without effects (e.g. scrolled off-screen). */
  remove() {
    this.dead = true;
    this.destroy();
  }

  offscreen(margin = 80): boolean {
    return this.x < -margin || this.x > 960 + margin * 3 || this.y < -margin * 2 || this.y > 540 + margin * 2;
  }
}
