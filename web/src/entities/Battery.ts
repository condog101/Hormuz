import Phaser from 'phaser';
import { DEPTH } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Audio } from '../systems/Audio';
import { rand } from '../systems/Random';
import { Entity } from './Entity';

const WARN_MS = 1400;

/** Anti-ship missile battery: sounds a klaxon, then launches. */
export class Battery extends Entity {
  private nextShot: number;
  private warnUntil = 0;
  private warning: Phaser.GameObjects.Text | null = null;

  constructor(game: GameScene, x: number, y: number, private north: boolean) {
    super(game, x, y, 'battery', 0);
    this.setDepth(DEPTH.ground).setFlipY(!north);
    this.hp = 4;
    this.radius = 18;
    this.kind = 'battery';
    this.nextShot = game.time.now + rand(400, 1200);
  }

  step(_dt: number) {
    const g = this.game_;
    if (this.dead) {
      if (this.x < -40) this.destroy();
      return;
    }
    if (this.x < -40) return this.remove();
    const now = g.time.now;
    this.warning?.setPosition(this.x, this.y + (this.north ? 34 : -34));
    if (this.warnUntil > 0) {
      this.setFrame(Math.floor(now / 120) % 2);
      if (now >= this.warnUntil) this.launch();
      return;
    }
    if (this.x > 120 && this.x < 940 && now >= this.nextShot && g.hostilesActive) {
      this.warnUntil = now + WARN_MS;
      Audio.play('klaxon', { minGapMs: 500 });
      this.warning = g.add
        .text(this.x, this.y, '! MISSILE !', { fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ff3b3b' })
        .setOrigin(0.5)
        .setStroke('#000', 3)
        .setDepth(DEPTH.fx);
      g.tweens.add({ targets: this.warning, alpha: 0.2, yoyo: true, repeat: -1, duration: 120 });
    }
  }

  private launch() {
    const g = this.game_;
    this.warnUntil = 0;
    this.warning?.destroy();
    this.warning = null;
    this.setFrame(0);
    this.nextShot = g.time.now + rand(5200, 7000);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, g.player.x, g.player.y);
    g.spawnMissile(this.x, this.y + (this.north ? 10 : -10), angle);
    Audio.play('launch');
  }

  die() {
    this.dead = true;
    this.warning?.destroy();
    this.warning = null;
    this.setFrame(2);
    this.game_.fx.explosion(this.x, this.y, true);
  }

  destroy(fromScene?: boolean) {
    this.warning?.destroy();
    super.destroy(fromScene);
  }
}
