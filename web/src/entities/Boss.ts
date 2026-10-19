import Phaser from 'phaser';
import { DAMAGE, DEPTH, PX } from '../data/balance';
import type { GameScene } from '../scenes/Game';
import { Audio } from '../systems/Audio';
import { rand } from '../systems/Random';
import { Entity } from './Entity';

/** Straight-flying hostile round (boss deck gun). */
export class BossBullet extends Entity {
  constructor(game: GameScene, x: number, y: number, private vx: number, private vy: number) {
    super(game, x, y, 'shell');
    this.setDepth(DEPTH.air).setTint(0xff6a3d).setScale(PX * 1.5);
    this.radius = 5;
    this.scrolls = false;
    this.shootable = false;
    this.contactDamage = DAMAGE.bossGun;
  }

  step(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.offscreen(20)) this.remove();
  }
}

/**
 * Fast-attack-craft mothership. Three phases by HP: deck gun only, faster gun +
 * boat launches, then swarms.
 */
export class Boss extends Entity {
  maxHp: number;
  private entered = false;
  private t = 0;
  private nextGun = 0;
  private nextLaunch = 0;
  private baseX = 790;

  constructor(game: GameScene, private tier: number) {
    super(game, 1060, 270, 'boss', 0);
    this.setDepth(DEPTH.sea + 1).setScale(PX * 1.5);
    this.maxHp = this.hp = 40 + 25 * tier;
    this.radius = 40;
    this.scrolls = false;
    this.kind = 'boss';
    Audio.play('bossAlarm');
  }

  get phase(): number {
    const f = this.hp / this.maxHp;
    return f > 0.66 ? 0 : f > 0.33 ? 1 : 2;
  }

  step(dt: number) {
    const g = this.game_;
    this.t += dt;
    if (!this.entered) {
      this.x -= 120 * dt;
      if (this.x <= this.baseX) {
        this.entered = true;
        this.nextGun = g.time.now + 800;
        this.nextLaunch = g.time.now + 2500;
      }
      return;
    }
    const [top, bot] = g.coast.waterBand(this.x - 60, this.x + 60);
    const mid = (top + bot) / 2;
    const amp = Math.max(0, (bot - top) / 2 - 50);
    this.y = mid + Math.sin(this.t * (0.6 + this.phase * 0.25)) * amp;
    this.x = this.baseX + Math.sin(this.t * 0.37) * 60;
    this.setFrame(this.phase);
    if (this.phase === 2 && Math.random() < dt * 4) g.fx.smoke(this.x + rand(-30, 30), this.y + rand(-10, 10));

    const now = g.time.now;
    if (now >= this.nextGun) {
      this.nextGun = now + [1500, 1050, 800][this.phase] - this.tier * 80;
      this.fireGun();
    }
    if (this.phase > 0 && now >= this.nextLaunch) {
      this.nextLaunch = now + (this.phase === 1 ? 4200 : 5200);
      const n = this.phase === 1 ? 1 : 3;
      for (let i = 0; i < n; i++) g.spawnBoat(this.x - 40, this.y + (i - (n - 1) / 2) * 26, Math.PI, i % 2 === 1);
    }
  }

  private fireGun() {
    const g = this.game_;
    const shots = this.phase === 2 ? 3 : 1;
    const base = Phaser.Math.Angle.Between(this.x - 40, this.y, g.player.x, g.player.y);
    for (let i = 0; i < shots; i++) {
      const a = base + (i - (shots - 1) / 2) * 0.16;
      g.addHostile(new BossBullet(g, this.x - 40, this.y, Math.cos(a) * 260, Math.sin(a) * 260));
    }
    Audio.play('shoot', { pitch: 0.7, volume: 0.6 });
  }

  die() {
    this.dead = true;
    const g = this.game_;
    for (let i = 0; i < 8; i++) {
      g.time.delayedCall(i * 140, () => {
        g.fx.explosion(this.x + rand(-50, 50), this.y + rand(-16, 16), i % 2 === 0);
        Audio.play('bigBoom', { minGapMs: 100 });
        g.fx.shake(0.01, 200);
      });
    }
    g.tweens.add({ targets: this, alpha: 0, duration: 1200, delay: 600, onComplete: () => this.destroy() });
  }
}
