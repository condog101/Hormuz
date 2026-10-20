import Phaser from 'phaser';
import { DEPTH, PLAYER, WIDTH } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Audio } from '../systems/Audio';
import { rand } from '../systems/Random';
import { Entity } from './Entity';

const FLIGHT_MS = 1200;

/** Shore gun. Flashes, then lobs a shell at where it thinks the ship will be. */
export class Artillery extends Entity {
  private nextShot: number;
  private smokeTimer = 0;

  constructor(game: GameScene, x: number, y: number, private north: boolean) {
    super(game, x, y, 'artillery', 0);
    this.setDepth(DEPTH.ground).setFlipY(!north);
    this.hp = 3;
    this.radius = 18;
    this.kind = 'artillery';
    this.nextShot = game.time.now + rand(600, 2000);
  }

  step(dt: number) {
    const g = this.game_;
    if (this.dead) {
      this.smokeTimer -= dt;
      if (this.smokeTimer <= 0 && this.x > 0 && this.x < WIDTH) {
        this.smokeTimer = 0.5;
        g.fx.smoke(this.x + rand(-6, 6), this.y - 6);
      }
      if (this.x < -40) this.destroy();
      return;
    }
    if (this.x < -40) return this.remove();
    const onScreen = this.x > 30 && this.x < 940;
    if (onScreen && g.time.now >= this.nextShot && g.hostilesActive) {
      const a = g.level.artillery;
      this.nextShot = g.time.now + rand(a.fireMinMs, a.fireMaxMs);
      this.fire();
    }
  }

  private fire() {
    const g = this.game_;
    const p = g.player;
    const a = g.level.artillery;
    // Predict where the ship will be when the shell lands, with imperfect lead.
    const t = FLIGHT_MS / 1000;
    const lead = a.lead * t;
    const spread = a.spread * (p.flank ? PLAYER.flankAccuracyMult : 1);
    const tx = p.x + g.playerVel.x * lead + rand(-spread, spread);
    const [top, bot] = g.coast.waterBand(tx - 4, tx + 4);
    const ty = Phaser.Math.Clamp(p.y + g.playerVel.y * lead + rand(-spread, spread) * 0.7, top + 6, bot - 6);
    this.setFrame(1);
    g.time.delayedCall(140, () => !this.dead && this.active && this.setFrame(0));
    g.fx.smoke(this.x, this.y + (this.north ? 14 : -14));
    Audio.play('boom', { volume: 0.25, pitch: 1.6, minGapMs: 80 });
    g.spawnShell(this.x, this.y + (this.north ? 16 : -16), tx, ty, FLIGHT_MS);
  }

  /** Destroyed emplacements stay on the map as smoking craters. */
  die() {
    this.dead = true;
    this.setFrame(2);
    this.game_.fx.explosion(this.x, this.y, true);
  }
}
