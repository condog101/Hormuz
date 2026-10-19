import Phaser from 'phaser';
import { KILL_POINTS, levelClearBonus } from '../../../shared/scoring';
import { CIWS, DAMAGE, DEPTH, HEIGHT, PICKUP_HEAL, PLAYER, WIDTH } from '../data/balance';
import { getLevel, type LevelDef } from '../data/levels';
import { Boss } from '../entities/Boss';
import type { Entity } from '../entities/Entity';
import { Missile } from '../entities/Missile';
import type { Pickup } from '../entities/Pickup';
import { Player } from '../entities/Player';
import { Round } from '../entities/Round';
import { Shell } from '../entities/Shell';
import { SuicideBoat } from '../entities/SuicideBoat';
import { Audio } from '../systems/Audio';
import { Coastline } from '../systems/Coastline';
import { Controls } from '../systems/Controls';
import { Fx } from '../systems/Fx';
import { HUD } from '../systems/HUD';
import { Popups } from '../systems/Popups';
import type { RunState } from '../systems/Run';
import { Spawner } from '../systems/Spawner';
import { COLORS, text } from '../systems/UI';

export interface LevelResult {
  run: RunState;
  levelScore: number;
  bonus: number;
  tookDamage: boolean;
  hp: number;
}

type Phase = 'transit' | 'boss' | 'clear' | 'over';

export class GameScene extends Phaser.Scene {
  run!: RunState;
  level!: LevelDef;
  coast!: Coastline;
  fx!: Fx;
  player!: Player;
  playerVel = { x: 0, y: 0 };
  scrollSpeed = 0;

  private controls!: Controls;
  private hud!: HUD;
  private popups!: Popups;
  private spawner!: Spawner;
  private enemies: Entity[] = [];
  private hostiles: Entity[] = [];
  private rounds: Round[] = [];
  private pickups: Pickup[] = [];
  private shells: Shell[] = [];
  private boss: Boss | null = null;
  private distance = 0;
  private length = 0;
  private phase: Phase = 'transit';
  private ciwsReadyAt = 0;
  private levelStartScore = 0;
  private tookDamage = false;
  private paused = false;
  private pauseUi: Phaser.GameObjects.Container | null = null;

  constructor() {
    super('Game');
  }

  init(data: { run: RunState }) {
    this.run = data.run;
    this.level = getLevel(this.run.level);
    this.enemies = [];
    this.hostiles = [];
    this.rounds = [];
    this.pickups = [];
    this.shells = [];
    this.boss = null;
    this.distance = 0;
    this.phase = 'transit';
    this.ciwsReadyAt = 0;
    this.tookDamage = false;
    this.paused = false;
    this.pauseUi = null;
    this.levelStartScore = this.run.score;
  }

  create() {
    this.length = this.level.scroll * this.level.durationS;
    this.scrollSpeed = this.level.scroll;
    this.coast = new Coastline(this, this.level, this.length);
    this.fx = new Fx(this);
    this.controls = new Controls(this);
    const [top, bot] = this.coast.waterBand(120, 220);
    this.player = new Player(this, 160, (top + bot) / 2);
    this.player.invulnUntil = this.time.now + 1500;
    this.hud = new HUD(this, this.level);
    this.popups = new Popups(this);
    this.spawner = new Spawner(this, this.level);
    this.time.delayedCall(1200, () => this.popups.trigger('start', true));
    this.cameras.main.fadeIn(400);
    const banner = text(this, WIDTH / 2, HEIGHT / 2 - 40, `LEVEL ${this.level.n}`, 24, COLORS.gold).setDepth(DEPTH.hud);
    this.tweens.add({ targets: banner, alpha: 0, delay: 1400, duration: 600, onComplete: () => banner.destroy() });
  }

  /** Shore guns and launchers hold fire once the ship is clear of the strait. */
  get hostilesActive(): boolean {
    return this.phase === 'transit' || this.phase === 'boss';
  }

  addEnemy(e: Entity) {
    this.enemies.push(e);
  }

  addHostile(e: Entity) {
    this.hostiles.push(e);
  }

  addPickup(p: Pickup) {
    this.pickups.push(p);
  }

  spawnBoat(x: number, y: number, heading: number, zig: boolean) {
    const L = this.level.boats;
    this.addEnemy(new SuicideBoat(this, x, y, heading, L.speed * Phaser.Math.FloatBetween(0.9, 1.1), zig));
  }

  spawnMissile(x: number, y: number, angle: number) {
    this.addEnemy(new Missile(this, x, y, angle));
  }

  spawnShell(x0: number, y0: number, tx: number, ty: number, flightMs: number) {
    this.shells.push(new Shell(this, x0, y0, tx, ty, flightMs));
  }

  shellLanded(x: number, y: number) {
    const p = this.player;
    // The hull is long and thin: measure from the nearest point on its centreline.
    const cx = Phaser.Math.Clamp(x, p.x - 54, p.x + 54);
    const hit = Math.hypot(x - cx, y - p.y) < 26;
    if (hit && !p.invulnerable) {
      this.fx.explosion(x, y);
      Audio.play('boom', { volume: 0.8 });
      this.damagePlayer(Math.round(DAMAGE.shell * Math.min(1, 0.55 + 0.05 * this.level.n)));
    } else {
      this.fx.splash(x, y);
      Audio.play('splash', { volume: 0.7 });
    }
  }

  damagePlayer(n: number) {
    const p = this.player;
    if (p.invulnerable || this.phase === 'clear' || this.phase === 'over') return;
    p.hp = Math.max(0, p.hp - n);
    this.tookDamage = true;
    p.invulnUntil = this.time.now + 250;
    p.setTintFill(0xffffff);
    this.time.delayedCall(70, () => p.clearTint());
    this.fx.shake(0.008, 180);
    Audio.play('hit');
    if (p.hp <= 0) this.loseLife();
    else if (Math.random() < 0.3) this.popups.trigger('damage');
  }

  private loseLife() {
    const p = this.player;
    this.run.lives--;
    Audio.play('death');
    this.fx.explosion(p.x, p.y, true);
    this.fx.shake(0.015, 400);
    this.popups.trigger('death', true);
    p.sink(() => {
      if (this.run.lives <= 0) {
        this.phase = 'over';
        this.cameras.main.fadeOut(600);
        this.time.delayedCall(700, () => this.scene.start('GameOver', { run: this.run, victory: false }));
      } else {
        const [top, bot] = this.coast.waterBand(120, 220);
        p.respawn(160, (top + bot) / 2);
      }
    });
  }

  private addScore(points: number, x: number, y: number) {
    this.run.score += points;
    this.fx.floatText(x, y - 10, `+${points}`);
  }

  private killed(e: Entity) {
    if (!e.kind) return;
    this.run.kills++;
    this.addScore(KILL_POINTS[e.kind], e.x, e.y);
    Audio.play(e.kind === 'boss' ? 'bigBoom' : 'boom', { minGapMs: 40 });
    if (e.kind === 'boss') {
      this.popups.trigger('boss', true);
      this.time.delayedCall(2200, () => this.levelClear());
    }
  }

  private fire() {
    const m = this.player.muzzle;
    this.rounds.push(new Round(this, m.x, m.y, this.player.turret.rotation));
    Audio.play('shoot', { volume: 0.7 });
    this.fx.smoke(m.x, m.y);
  }

  private ciws() {
    const now = this.time.now;
    if (now < this.ciwsReadyAt || this.player.sinking) return;
    const p = this.player;
    const targets = [...this.enemies, ...this.hostiles]
      .filter((e) => !e.dead && e.ciwsTarget && Math.hypot(e.x - p.x, e.y - p.y) < CIWS.range)
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
      .slice(0, CIWS.maxTargets);
    this.ciwsReadyAt = now + CIWS.cooldownMs;
    if (targets.length === 0) {
      Audio.play('ciws', { volume: 0.4 });
      return;
    }
    targets.forEach((t, i) => {
      this.time.delayedCall(i * CIWS.burstMs, () => {
        if (t.dead || !t.active) return;
        for (let k = 0; k < 4; k++) {
          this.time.delayedCall(k * 35, () => {
            if (!t.active) return;
            this.fx.tracer(p.x + 10, p.y - 6, t.x + Phaser.Math.Between(-4, 4), t.y + Phaser.Math.Between(-4, 4));
            Audio.play('ciws', { minGapMs: 25 });
          });
        }
        this.time.delayedCall(140, () => {
          if (!t.dead && t.active && t.damage(99)) this.killed(t);
        });
      });
    });
  }

  private levelClear() {
    if (this.phase === 'clear' || this.phase === 'over') return;
    this.phase = 'clear';
    this.spawner.active = false;
    const hp = this.player.hp;
    const bonus = levelClearBonus(this.level.n, hp, this.tookDamage);
    this.run.score += bonus;
    Audio.play('clear');
    const result: LevelResult = {
      run: this.run,
      levelScore: this.run.score - this.levelStartScore,
      bonus,
      tookDamage: this.tookDamage,
      hp,
    };
    // Sail off to the east.
    this.tweens.add({ targets: this.player, x: WIDTH + 120, duration: 2200, ease: 'Quad.easeIn', delay: 500 });
    this.time.delayedCall(2600, () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(450, () => this.scene.start('LevelClear', result));
    });
  }

  private togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.tweens.pauseAll();
      this.anims.pauseAll();
      this.time.paused = true;
      const bg = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.6).setOrigin(0);
      const t = text(this, WIDTH / 2, HEIGHT / 2 - 20, 'PAUSED', 24, COLORS.gold);
      const h = text(this, WIDTH / 2, HEIGHT / 2 + 24, 'ESC RESUME   Q QUIT TO MENU', 8, COLORS.dim);
      this.pauseUi = this.add.container(0, 0, [bg, t, h]).setDepth(DEPTH.popup + 10);
      this.input.keyboard!.once('keydown-Q', () => {
        if (!this.paused) return;
        this.time.paused = false;
        this.scene.start('Title');
      });
    } else {
      this.tweens.resumeAll();
      this.anims.resumeAll();
      this.time.paused = false;
      this.pauseUi?.destroy();
      this.pauseUi = null;
    }
  }

  update(_time: number, deltaMs: number) {
    if (this.controls.pause() && this.phase !== 'over') this.togglePause();
    if (this.paused) return;
    const dtMs = Math.min(deltaMs, 50);
    const dt = dtMs / 1000;
    if (this.phase !== 'over') this.run.playMs += dtMs;

    // world scroll
    const dx = this.scrollSpeed * dt;
    this.distance += dx;
    this.coast.update(dx, dtMs);
    this.fx.update(dx);
    this.spawner.update(dtMs, this.distance);

    if (this.phase === 'transit' && this.distance >= this.length) {
      this.spawner.active = false;
      if (this.level.boss) {
        this.phase = 'boss';
        this.boss = new Boss(this, this.level.n >= 10 ? 2 : 1);
        this.addEnemy(this.boss);
      } else {
        this.levelClear();
      }
    }

    // player
    const p = this.player;
    if (this.phase !== 'clear') {
      const move = this.controls.move();
      const px = p.x;
      const py = p.y;
      const tp = p.turretPos;
      p.step(dt, move, this.controls.aim(tp.x, tp.y), this.controls.flank());
      this.playerVel.x = (p.x - px) / dt;
      this.playerVel.y = (p.y - py) / dt;
      if (this.controls.firing() && p.canFire(this.time.now)) this.fire();
      if (this.controls.ciws()) this.ciws();
    }

    // entities
    for (const s of this.shells) s.step(dt, dx);
    this.shells = this.shells.filter((s) => !s.done);
    const stepAll = <T extends Entity>(list: T[]) => {
      for (const e of list) {
        if (!e.active) continue;
        if (e.scrolls) e.x -= dx;
        e.step(dt);
      }
      return list.filter((e) => e.active);
    };
    this.enemies = stepAll(this.enemies);
    this.hostiles = stepAll(this.hostiles);
    this.pickups = stepAll(this.pickups);
    this.rounds = stepAll(this.rounds);

    this.collide();

    this.hud.update({
      hp: p.hp,
      lives: this.run.lives,
      score: this.run.score,
      progress: this.distance / this.length,
      ciwsReady: HUD.ciwsFraction(this.time.now, this.ciwsReadyAt),
      boss: this.boss && !this.boss.dead ? { hp: this.boss.hp, max: this.boss.maxHp } : undefined,
    });
    this.popups.update(dtMs);
  }

  private collide() {
    // rounds vs enemies
    for (const r of this.rounds) {
      if (r.dead) continue;
      for (const e of this.enemies) {
        if (e.dead || !e.shootable) continue;
        const rad = e.radius + r.radius;
        if (Math.abs(e.x - r.x) < rad && Math.abs(e.y - r.y) < rad && Math.hypot(e.x - r.x, e.y - r.y) < rad) {
          r.remove();
          this.fx.explosion(r.x, r.y);
          if (e.damage(1)) this.killed(e);
          break;
        }
      }
    }
    // contact damage
    const p = this.player;
    if (!p.sinking) {
      for (const e of [...this.enemies, ...this.hostiles]) {
        if (e.dead || e.contactDamage <= 0) continue;
        // destroyer hitbox: a capsule along its length
        const cx = Phaser.Math.Clamp(e.x, p.x - 50, p.x + 50);
        if (Math.hypot(e.x - cx, e.y - p.y) < PLAYER.hitRadius + e.radius) {
          if (p.invulnerable && !(e instanceof SuicideBoat || e instanceof Missile)) continue;
          const dmg = e.contactDamage;
          e.die();
          if (e.kind === 'boat' || e.kind === 'boatZig' || e.kind === 'missile' || e.kind === 'drone' || e.kind === 'mine')
            Audio.play('boom');
          this.damagePlayer(dmg);
        }
      }
      for (const pk of this.pickups) {
        if (pk.dead) continue;
        if (Math.hypot(pk.x - p.x, pk.y - p.y) < 50 && Math.abs(pk.y - p.y) < 30) {
          p.hp = Math.min(PLAYER.hp, p.hp + PICKUP_HEAL);
          p.updateFrame();
          this.fx.floatText(pk.x, pk.y, `+${PICKUP_HEAL} HULL`, COLORS.green);
          Audio.play('pickup');
          pk.remove();
        }
      }
    }
  }
}
