import Phaser from 'phaser';
import { DAMAGE, DEPTH, HEIGHT, TILE } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Audio } from '../systems/Audio';
import { rand } from '../systems/Random';
import { HostileBullet } from './Bullet';
import { Entity } from './Entity';

const SLOW_MS = 1300;
const WARN_MS = 500;
const SHOTS = 6;
const SHOT_GAP_MS = 90;
const SPREAD = 0.14;
const BULLET_SPEED = 300;

/** Lowrider on the coast road: cruises in, slows alongside the ship, sprays a burst, peels off. */
export class Lowrider extends Entity {
  private mode: 'cruise' | 'slow' | 'leave' = 'cruise';
  private slowUntil = 0;
  private nextShot = 0;
  private shotsLeft = 0;
  private smokeTimer = 0;
  private warning: Phaser.GameObjects.Text | null = null;
  private base: number;

  constructor(
    game: GameScene,
    x: number,
    y: number,
    private side: 'top' | 'bot',
    blue: boolean,
  ) {
    super(game, x, y, 'lowrider', blue ? 5 : 0);
    this.base = blue ? 5 : 0;
    this.play(blue ? 'lowrider_blue' : 'lowrider_red').setDepth(DEPTH.ground + 1);
    this.hp = 2;
    this.radius = 14;
    this.scrolls = false;
    this.kind = 'lowrider';
    Audio.play('horn', { volume: 0.6, minGapMs: 800 });
  }

  step(dt: number) {
    const g = this.game_;
    if (this.dead) {
      this.smokeTimer -= dt;
      if (this.smokeTimer <= 0 && this.x > 0 && this.x < 960) {
        this.smokeTimer = 0.5;
        g.fx.smoke(this.x + rand(-6, 6), this.y - 8);
      }
      if (this.x < -40) this.destroy();
      return;
    }
    const now = g.time.now;
    const p = g.player;
    if (this.mode === 'cruise' && g.hostilesActive && this.x >= p.x - 40 && this.x <= p.x + 240) {
      this.mode = 'slow';
      this.slowUntil = now + SLOW_MS;
      this.nextShot = now + WARN_MS;
      this.shotsLeft = SHOTS;
      g.onDriveBy();
      this.warning = g.add
        .text(this.x, this.y, '! DRIVE-BY !', { fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ff3b3b' })
        .setOrigin(0.5)
        .setStroke('#000', 3)
        .setDepth(DEPTH.fx);
      g.tweens.add({ targets: this.warning, alpha: 0.2, yoyo: true, repeat: -1, duration: 120 });
    }
    if (this.mode === 'slow') {
      if (this.warning && now >= this.nextShot) this.clearWarning();
      if (this.shotsLeft > 0 && now >= this.nextShot && !p.sinking) {
        this.shotsLeft--;
        this.nextShot = now + SHOT_GAP_MS;
        this.shoot();
      }
      if (now >= this.slowUntil) {
        this.mode = 'leave';
        this.play(this.base === 5 ? 'lowrider_blue' : 'lowrider_red');
      }
    }
    const speed = g.scrollSpeed + (this.mode === 'slow' ? 15 : 110);
    this.x -= speed * dt;
    // Follow the road; where it runs out (cliffs, thin land) stay on the beach just inland of the surf.
    const c = g.coast;
    const beach = this.side === 'top' ? Math.max(TILE / 2, c.topEdge(this.x) - TILE / 2) : Math.min(HEIGHT - TILE / 2, c.botEdge(this.x) + TILE / 2);
    const ty = c.roadSpot(this.x, this.side) ?? beach;
    this.y += (ty - this.y) * Math.min(1, dt * 4);
    this.warning?.setPosition(this.x, this.y + (this.side === 'top' ? 22 : -22));
    if (this.x < -60) this.remove();
  }

  private shoot() {
    const g = this.game_;
    const p = g.player;
    this.stop();
    this.setFrame(this.base + 3);
    const a = Phaser.Math.Angle.Between(this.x, this.y, p.x, p.y) + rand(-SPREAD, SPREAD);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    g.addHostile(new HostileBullet(g, this.x, this.y, cos * BULLET_SPEED, sin * BULLET_SPEED, DAMAGE.driveBy, 0xffe14d));
    g.fx.tracer(this.x, this.y, this.x + cos * 18, this.y + sin * 18);
    Audio.play('mac', { minGapMs: 40 });
  }

  private clearWarning() {
    this.warning?.destroy();
    this.warning = null;
  }

  /** The wreck stays on the road, burning, and scrolls off with the land. */
  die() {
    this.dead = true;
    this.clearWarning();
    this.stop();
    this.setFrame(this.base + 4);
    this.scrolls = true;
    this.game_.fx.explosion(this.x, this.y, true);
  }

  destroy(fromScene?: boolean) {
    this.clearWarning();
    super.destroy(fromScene);
  }
}
