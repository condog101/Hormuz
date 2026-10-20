import Phaser from 'phaser';
import { KILL_POINTS, levelClearBonus } from '../../../shared/scoring';
import { DAMAGE, DEPTH, DISS, HEIGHT, OX, PICKUP_HEAL, PLAYER, WEAPON_ORDER, WEAPONS, WIDTH, type WeaponKey } from '../data/balance';
import { getLevel, type LevelDef } from '../data/levels';
import { ADLIBS, GUESTS, renderLine, type GuestKey } from '../data/quotes';
import { BEATS, type Beat } from '../data/story';
import { Boss } from '../entities/Boss';
import { DissMissile } from '../entities/DissMissile';
import type { Entity } from '../entities/Entity';
import { MicPickup } from '../entities/MicPickup';
import { Missile } from '../entities/Missile';
import { Mortar } from '../entities/Mortar';
import type { Pickup } from '../entities/Pickup';
import { Player } from '../entities/Player';
import { Round } from '../entities/Round';
import { Shell } from '../entities/Shell';
import { SuicideBoat } from '../entities/SuicideBoat';
import { Audio } from '../systems/Audio';
import { Coastline } from '../systems/Coastline';
import { Controls } from '../systems/Controls';
import { TOUCH } from '../systems/Device';
import { Fx } from '../systems/Fx';
import { HUD } from '../systems/HUD';
import { Music } from '../systems/Music';
import { DON, Popups, type Shown, type Speaker } from '../systems/Popups';
import type { RunState } from '../systems/Run';
import { Spawner } from '../systems/Spawner';
import { Ticker } from '../systems/Ticker';
import { COLORS, menu, text } from '../systems/UI';

export interface LevelResult {
  run: RunState;
  levelScore: number;
  bonus: number;
  tookDamage: boolean;
  hp: number;
  /** Guest who featured on this track, if any. */
  feat?: string;
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
  private ticker!: Ticker;
  private spawner!: Spawner;
  private enemies: Entity[] = [];
  private hostiles: Entity[] = [];
  private rounds: Round[] = [];
  private disses: DissMissile[] = [];
  private pickups: (Pickup | MicPickup)[] = [];
  private shells: Shell[] = [];
  private mortars: Mortar[] = [];
  private boss: Boss | null = null;
  private distance = 0;
  private length = 0;
  private phase: Phase = 'transit';
  private dissReadyAt = 0;
  /** DISS was charged last frame (the ready cue plays on the edge). */
  private dissWasReady = true;
  private levelStartScore = 0;
  private tookDamage = false;
  private paused = false;
  private pauseUi: Phaser.GameObjects.Container | null = null;
  private pauseMenu: { destroy(): void } | null = null;
  /** Recent kill timestamps for the streak popup (5 kills within 3 s). */
  private killTimes: number[] = [];
  /** The low-hull line fires once per life. */
  private lowHullSaid = false;
  /** Big Don comments on the first drive-by of each track. */
  private driveBySeen = false;
  /** Main-gun shots fired this track (muzzle smoke on every 4th NINE round). */
  private shots = 0;
  /** Running guest-feature buff. */
  private buff: GuestKey | null = null;
  private buffStart = 0;
  private buffUntil = 0;
  private feat: string | undefined;
  /** Story beats for this track that haven't fired yet. */
  private beats: Beat[] = [];
  /** Touch: a story moment (guest feature or story call) shown full-screen while the game is frozen. */
  private story: Phaser.GameObjects.Container | null = null;
  /** The last story line, for the pause screen on touch (desktop reads the card's). */
  private lastStory: Shown | null = null;
  /** scene.time.now keeps running while frozen, so timers are pushed back by the frozen time. */
  private frozenAt = 0;

  constructor() {
    super('Game');
  }

  init(data: { run: RunState }) {
    this.run = data.run;
    this.level = getLevel(this.run.level);
    this.enemies = [];
    this.hostiles = [];
    this.rounds = [];
    this.disses = [];
    this.pickups = [];
    this.shells = [];
    this.mortars = [];
    this.shots = 0;
    this.boss = null;
    this.distance = 0;
    this.phase = 'transit';
    this.dissReadyAt = 0;
    this.dissWasReady = true;
    this.tookDamage = false;
    this.paused = false;
    this.pauseUi = null;
    this.pauseMenu = null;
    this.killTimes = [];
    this.lowHullSaid = false;
    this.driveBySeen = false;
    this.buff = null;
    this.buffUntil = 0;
    this.feat = undefined;
    this.beats = this.run.mode === 'campaign' ? BEATS.filter((b) => b.level === this.run.level) : [];
    this.story = null;
    this.lastStory = null;
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
    this.hud.setWeapon(this.run.weapon);
    this.controls.setWeapon(this.run.weapon);
    // Touch only: a backgrounded phone comes back to the pause screen, not straight into fire.
    const onHidden = () => {
      if (TOUCH && !this.paused && this.phase !== 'over') this.togglePause();
    };
    this.game.events.on(Phaser.Core.Events.HIDDEN, onHidden);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.HIDDEN, onHidden);
      this.controls.destroy();
    });
    this.popups = new Popups(this);
    this.ticker = new Ticker(this);
    this.spawner = new Spawner(this, this.level);
    this.time.delayedCall(1200, () => this.ticker.trigger('start', true));
    Music.play('game');
    this.cameras.main.fadeIn(400);
    if (this.level.haze) {
      this.add.image(0, 0, 'haze').setOrigin(0).setDisplaySize(WIDTH, HEIGHT).setAlpha(0.16 * this.level.haze).setDepth(DEPTH.fx + 5);
    }
    const n = this.level.n;
    const banner = text(this, WIDTH / 2, HEIGHT / 2 - 40, n > 10 ? `HIDDEN TRACK ${n - 10}` : `TRACK ${n}`, 24, COLORS.purple).setDepth(DEPTH.hud);
    this.tweens.add({ targets: banner, alpha: 0, delay: 1400, duration: 600, onComplete: () => banner.destroy() });
  }

  /** Shore guns and launchers hold fire once the ship is clear of the strait. */
  get hostilesActive(): boolean {
    return this.phase === 'transit' || this.phase === 'boss';
  }

  /** Up to `n` live shootable enemies within `range` of (x, y), nearest first. */
  nearestEnemies(x: number, y: number, n: number, range: number): Entity[] {
    return this.enemies
      .filter((e) => !e.dead && e.active && e.shootable && e.kind && Math.hypot(e.x - x, e.y - y) < range)
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
      .slice(0, n);
  }

  /** LAID BACK slows everything hostile to half speed. */
  private get hostileScale(): number {
    return this.buff === 'snoop' ? 0.5 : 1;
  }

  addEnemy(e: Entity) {
    this.enemies.push(e);
  }

  addHostile(e: Entity) {
    this.hostiles.push(e);
  }

  /** A lowrider has started its drive-by. */
  onDriveBy() {
    if (this.driveBySeen) return;
    this.driveBySeen = true;
    this.ticker.trigger('driveBy', true);
  }

  addPickup(p: Pickup | MicPickup) {
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

  /** THE 808's blast: every live shootable enemy within `r` (plus its own radius) takes `dmg`. */
  areaDamage(x: number, y: number, r: number, dmg: number) {
    for (const e of [...this.enemies]) {
      if (e.dead || !e.active || !e.shootable) continue;
      if (Math.hypot(e.x - x, e.y - y) < r + e.radius && e.damage(dmg)) this.killed(e);
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
    else if (p.hp < 30 && !this.lowHullSaid) {
      this.lowHullSaid = true;
      this.ticker.trigger('lowHull');
    } else if (Math.random() < 0.3) this.ticker.trigger('damage');
  }

  private loseLife() {
    const p = this.player;
    this.endBuff();
    this.run.lives--;
    Audio.play('death');
    this.fx.explosion(p.x, p.y, true);
    this.fx.shake(0.015, 400);
    this.ticker.trigger('death', true);
    p.sink(() => {
      if (this.run.lives <= 0) {
        this.phase = 'over';
        this.cameras.main.fadeOut(600);
        this.time.delayedCall(700, () => this.scene.start('GameOver', { run: this.run, victory: false }));
      } else {
        const [top, bot] = this.coast.waterBand(120, 220);
        p.respawn(160, (top + bot) / 2);
        this.lowHullSaid = false;
      }
    });
  }

  private addScore(points: number, x: number, y: number) {
    this.run.score += points;
    this.fx.floatText(x, y - 10, `+${points}`);
  }

  /** Golden mic collected: somebody other than last time drops a verse and a buff, then Big Don answers them. */
  private startGuest() {
    const p = this.player;
    const now = this.time.now;
    const pool = (Object.keys(GUESTS) as GuestKey[]).filter((k) => k !== this.run.lastGuest);
    const k = Phaser.Utils.Array.GetRandom(pool);
    const guest = GUESTS[k];
    this.run.lastGuest = k;
    this.feat = guest.name;
    this.endBuff();
    Audio.play('clear');
    const ex = Phaser.Utils.Array.GetRandom(guest.exchanges);
    this.storyMoment(this.guestSpeaker(k), ex.guest, ex.don);
    this.fx.adlib(p.x, p.y - 40, `FEAT. ${guest.name}`);
    this.buff = k;
    this.buffStart = now;
    if (k === 'cube') {
      // ICE COLD: untouchable, double fire rate, ice-blue ship and rounds
      this.buffUntil = now + 8000;
      p.invulnUntil = Math.max(p.invulnUntil, this.buffUntil);
      p.fireMult = 0.5;
      p.buffTint = 0x9fe3ff;
    } else if (k === 'snoop') {
      // LAID BACK: everything hostile at half speed (see hostileScale)
      this.buffUntil = now + 8000;
      p.buffTint = 0xc99bff;
    } else if (k === 'dre') {
      // THE DOCTOR: +30 hull now, then +3 hull a second
      this.buffUntil = now + 10000;
      p.hp = Math.min(PLAYER.hp, p.hp + 30);
      p.updateFrame();
      p.buffTint = 0x9dffb4;
      this.fx.floatText(p.x, p.y - 20, '+30 HULL', COLORS.green);
    } else {
      // DOUBLE UP: +40 hull, double kill points, an ad-lib on every kill
      this.buffUntil = now + 10000;
      p.hp = Math.min(PLAYER.hp, p.hp + 40);
      p.updateFrame();
      this.fx.floatText(p.x, p.y - 20, '+40 HULL', COLORS.green);
    }
  }

  private guestSpeaker(k: GuestKey): Speaker {
    const g = GUESTS[k];
    return { name: g.name, key: 'guests', rest: g.frame, talk: g.frame + 1 };
  }

  /** A story beat: a guest calls in, Big Don answers five seconds after they finish. */
  private playBeat(b: Beat) {
    this.beats = this.beats.filter((x) => x !== b);
    this.storyMoment(this.guestSpeaker(b.guest), b.line, b.don, 5000);
  }

  /** A guest line and Big Don's answer: the slide-in card on desktop, a story pause on touch. */
  private storyMoment(speaker: Speaker, line: string, don: string, replyDelayMs?: number) {
    if (!TOUCH) {
      this.popups.say(speaker, line, don, replyDelayMs);
      return;
    }
    this.openStory([
      { speaker, frame: speaker.rest, text: renderLine(line) },
      { speaker: DON, frame: 0, text: renderLine(don) },
    ]);
  }

  private endBuff() {
    if (!this.buff) return;
    const p = this.player;
    if (this.buff === 'cube') {
      p.invulnUntil = Math.min(p.invulnUntil, this.time.now);
      p.fireMult = 1;
    }
    if (p.buffTint !== null) {
      p.buffTint = null;
      p.clearTint();
      p.turret.clearTint();
    }
    this.buff = null;
    this.buffUntil = 0;
    this.hud.setBuff('', 0);
  }

  private killed(e: Entity) {
    if (!e.kind) return;
    this.run.kills++;
    const doubled = this.buff === 'pac';
    this.addScore(KILL_POINTS[e.kind] * (doubled ? 2 : 1), e.x, e.y);
    Audio.play(e.kind === 'boss' ? 'bigBoom' : 'boom', { minGapMs: 40 });
    // hype man: an ad-lib on every third kill and on every streak
    const now = this.time.now;
    this.killTimes = this.killTimes.filter((t) => now - t < 3000);
    this.killTimes.push(now);
    let adlib = doubled || this.run.kills % 3 === 0;
    if (this.killTimes.length >= 5) {
      this.killTimes = [];
      this.ticker.trigger('streak');
      adlib = true;
    }
    if (adlib) this.fx.adlib(e.x, e.y - 22, Phaser.Utils.Array.GetRandom(doubled ? [...ADLIBS, 'WEST SIDE!'] : ADLIBS));
    if (e.kind === 'boss') {
      this.ticker.trigger('boss', true);
      this.time.delayedCall(2200, () => this.levelClear());
    }
  }

  private fire(key: WeaponKey) {
    const w = WEAPONS[key];
    const p = this.player;
    const m = p.muzzle;
    const aim = p.turret.rotation;
    const tint = p.buffTint ?? undefined;
    this.shots++;
    if (key === 'nine') {
      const a = aim + Phaser.Math.FloatBetween(-w.spread, w.spread);
      this.rounds.push(new Round(this, m.x, m.y, a, { speed: w.speed, damage: w.damage, tint }));
      Audio.play('shoot', { pitch: 1.3, volume: 0.5 });
      if (this.shots % 4 === 0) this.fx.smoke(m.x, m.y);
    } else if (key === 'pump') {
      for (let i = 0; i < w.shots; i++) {
        const a = aim - w.spread + (2 * w.spread * i) / (w.shots - 1);
        this.rounds.push(new Round(this, m.x, m.y, a, { speed: w.speed, damage: w.damage, ttlS: w.ttlS, tint }));
      }
      Audio.play('pump');
      this.fx.smoke(m.x, m.y);
      this.fx.smoke(m.x + Math.cos(aim) * 10, m.y + Math.sin(aim) * 10);
      this.fx.shake(0.004, 80);
    } else {
      // Lob to the aim point, no further than the range and never onto the land.
      const tp = p.turretPos;
      const target = this.controls.aimPoint(tp.x, tp.y);
      const d = Math.hypot(target.x - m.x, target.y - m.y);
      const k = d > w.range! ? w.range! / d : 1;
      const tx = Phaser.Math.Clamp(m.x + (target.x - m.x) * k, 0, WIDTH);
      const [top, bot] = this.coast.waterBand(tx - 4, tx + 4);
      const ty = Phaser.Math.Clamp(m.y + (target.y - m.y) * k, top + 6, bot - 6);
      this.mortars.push(new Mortar(this, m.x, m.y, tx, ty, w.flightMs!, w.radius!, w.damage));
      Audio.play('launch', { pitch: 1.4 });
      this.fx.smoke(m.x, m.y);
    }
  }

  private switchWeapon(pick: { select?: number; cycle?: 1 | -1 }) {
    const i = WEAPON_ORDER.indexOf(this.run.weapon);
    const next = pick.select ?? (i + (pick.cycle ?? 0) + WEAPON_ORDER.length) % WEAPON_ORDER.length;
    const key = WEAPON_ORDER[next];
    if (!key || key === this.run.weapon) return;
    this.run.weapon = key;
    this.hud.setWeapon(key);
    this.controls.setWeapon(key);
    Audio.play('select');
    this.fx.adlib(this.player.x, this.player.y - 34, WEAPONS[key].name);
    if (!this.run.switchedWeapon) {
      this.run.switchedWeapon = true;
      this.ticker.trigger('weapon');
    }
  }

  /** DISS TRACKS: lock the nearest opps and send a guided missile at each. Charge is kept if nothing is in range. */
  private fireDiss() {
    const now = this.time.now;
    const p = this.player;
    if (now < this.dissReadyAt || p.sinking) return;
    const targets = this.nearestEnemies(p.x, p.y, DISS.count, DISS.range);
    if (targets.length === 0) {
      this.fx.floatText(p.x, p.y - 30, 'NO OPPS IN RANGE', COLORS.dim);
      Audio.play('select');
      return;
    }
    this.dissReadyAt = now + DISS.rechargeMs;
    this.fx.adlib(p.x, p.y - 34, 'DISS!');
    for (let i = 0; i < DISS.count; i++) {
      const t = targets[i % targets.length];
      this.time.delayedCall(i * DISS.launchGapMs, () => {
        if (p.sinking || this.phase === 'over') return;
        // fan the salvo out evenly either side of straight up
        const k = i - (DISS.count - 1) / 2;
        this.disses.push(new DissMissile(this, p.x + k * 8, p.y - 6, -Math.PI / 2 + k * 0.35, t.dead ? null : t));
        Audio.play('launch', { pitch: 1.2 + i * 0.1, minGapMs: 40 });
      });
    }
    if (!this.run.usedDiss) {
      this.run.usedDiss = true;
      this.ticker.trigger('diss', true);
    } else if (Math.random() < 0.2) this.ticker.trigger('diss');
  }

  private levelClear() {
    if (this.phase === 'clear' || this.phase === 'over') return;
    this.phase = 'clear';
    this.spawner.active = false;
    const hp = this.player.hp;
    this.endBuff();
    const bonus = levelClearBonus(this.level.n, hp, this.tookDamage);
    this.run.score += bonus;
    Audio.play('clear');
    const result: LevelResult = {
      run: this.run,
      levelScore: this.run.score - this.levelStartScore,
      bonus,
      tookDamage: this.tookDamage,
      hp,
      feat: this.feat,
    };
    // Sail off to the east.
    this.tweens.add({ targets: this.player, x: WIDTH + 120, duration: 2200, ease: 'Quad.easeIn', delay: 500 });
    this.time.delayedCall(2600, () => {
      Music.play('title');
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(450, () => this.scene.start('LevelClear', result));
    });
  }

  /** Stop (or restart) the world: tweens, animations, timers, music level and the touch controls. */
  private freeze(on: boolean) {
    if (on) {
      this.frozenAt = this.time.now;
      this.tweens.pauseAll();
      this.anims.pauseAll();
      this.time.paused = true;
    } else {
      this.tweens.resumeAll();
      this.anims.resumeAll();
      this.time.paused = false;
      // Don't let a pause or a story eat the DISS recharge, the guest buff or invulnerability.
      const d = this.time.now - this.frozenAt;
      this.dissReadyAt += d;
      if (this.buff) {
        this.buffStart += d;
        this.buffUntil += d;
      }
      if (this.player.invulnUntil > this.frozenAt) this.player.invulnUntil += d;
    }
    Music.duck(on);
    this.controls.setEnabled(!on);
    this.popups.setHidden(on);
  }

  private togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.freeze(true);
      const bg = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.6).setOrigin(0);
      const last = this.lastStory ?? this.popups.lastLine;
      const t = text(this, WIDTH / 2, last ? 150 : HEIGHT / 2 - 20, 'HOLD UP', 24, COLORS.gold);
      this.pauseUi = this.add.container(0, 0, [bg, t]).setDepth(DEPTH.popup + 10);
      if (last) {
        this.pauseUi.add(text(this, WIDTH / 2, 196, `LAST FROM ${last.speaker.name}`, 8, COLORS.red));
        this.pauseUi.add(text(this, WIDTH / 2, 214, last.text, TOUCH ? 12 : 8, COLORS.text).setOrigin(0.5, 0).setWordWrapWidth(700));
      }
      const y = last ? 330 : HEIGHT / 2 + 24;
      if (TOUCH) {
        this.pauseMenu = menu(
          this,
          WIDTH / 2,
          y + 10,
          [
            { label: 'RESUME', action: () => this.paused && this.togglePause() },
            { label: 'BACK TO THE STUDIO', action: () => this.quitToTitle() },
          ],
          40,
          DEPTH.popup + 11,
        );
      } else {
        this.pauseUi.add(text(this, WIDTH / 2, y, 'ESC RESUME   Q BACK TO THE STUDIO', 8, COLORS.dim));
      }
      this.input.keyboard!.once('keydown-Q', () => this.quitToTitle());
    } else {
      this.freeze(false);
      this.pauseUi?.destroy();
      this.pauseUi = null;
      this.pauseMenu?.destroy();
      this.pauseMenu = null;
    }
  }

  /** Touch: freeze the game and show a story moment big, one row per line; a tap (after a beat) carries on. */
  private openStory(lines: Shown[]) {
    if (this.story) return;
    this.freeze(true);
    this.lastStory = lines[0];
    const left = OX + 60;
    const items: Phaser.GameObjects.GameObject[] = [this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.88).setOrigin(0)];
    lines.forEach((l, i) => {
      const y = 48 + i * 200;
      const don = l.speaker === DON;
      items.push(
        this.add.sprite(left, y, l.speaker.key, l.frame).setOrigin(0).setScale(2).setCrop(0, 0, 64, 56),
        text(this, left + 152, y + 14, don ? '● BIG DON' : `● GUEST FEATURE - ${l.speaker.name}`, 12, don ? COLORS.red : COLORS.gold, 0).setOrigin(0, 0.5),
        text(this, left + 152, y + 36, l.text, 14, COLORS.text, 0).setOrigin(0).setAlign('left').setWordWrapWidth(WIDTH - 2 * left - 152).setLineSpacing(8),
      );
    });
    const hint = text(this, WIDTH / 2, HEIGHT - 36, 'TAP TO GET BACK TO IT', 12, COLORS.gold);
    this.tweens.add({ targets: hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 500 });
    items.push(hint);
    this.story = this.add.container(0, 0, items).setDepth(DEPTH.popup + 20);
    Audio.play('incoming');
    const bleeps = lines.reduce((n, l) => n + (l.text.match(/\*+/g) ?? []).length, 0);
    for (let k = 0; k < bleeps; k++) setTimeout(() => Audio.play('bleep', { volume: 0.6 }), 300 + k * 260);
    // The game clock is frozen, so time the tap guard on the wall clock: a finger that was already
    // firing when the story landed shouldn't dismiss it.
    const openedAt = performance.now();
    const onTap = () => {
      if (performance.now() - openedAt < 600) return;
      this.input.off('pointerdown', onTap);
      this.closeStory();
    };
    this.input.on('pointerdown', onTap);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.off('pointerdown', onTap));
  }

  private closeStory() {
    if (!this.story) return;
    this.tweens.killTweensOf(this.story.list);
    this.story.destroy();
    this.story = null;
    this.freeze(false);
    // drop a pause tap that landed while the story was up
    this.controls.pause();
  }

  private quitToTitle() {
    if (!this.paused) return;
    this.time.paused = false;
    this.scene.start('Title');
  }

  update(_time: number, deltaMs: number) {
    if (this.story) return;
    if (this.controls.pause() && this.phase !== 'over') this.togglePause();
    if (this.paused) return;
    const dtMs = Math.min(deltaMs, 50);
    const dt = dtMs / 1000;
    // LAID BACK: hostile movement, fire and spawns run on a slower clock
    const hdt = dt * this.hostileScale;
    if (this.phase !== 'over') this.run.playMs += dtMs;

    // world scroll
    const dx = this.scrollSpeed * dt;
    this.distance += dx;
    this.coast.update(dx, dtMs);
    this.fx.update(dx);
    this.spawner.update(dtMs * this.hostileScale, this.distance);
    for (const b of this.beats) {
      if (b.at !== 'boss' && this.phase === 'transit' && this.distance >= b.at * this.length) {
        this.playBeat(b);
        break;
      }
    }

    if (this.phase === 'transit' && this.distance >= this.length) {
      this.spawner.active = false;
      if (this.level.boss) {
        this.phase = 'boss';
        this.boss = new Boss(this, this.level.n >= 10 ? 2 : 1);
        this.addEnemy(this.boss);
        const beat = this.beats.find((b) => b.at === 'boss');
        if (beat) this.playBeat(beat);
        else this.ticker.trigger('bossIntro', true);
        Music.play('boss');
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
      const pick = this.controls.weapon();
      if (pick.select !== undefined || pick.cycle) this.switchWeapon(pick);
      const weapon = this.run.weapon;
      if (this.controls.firing() && p.canFire(this.time.now, WEAPONS[weapon].cooldownMs)) this.fire(weapon);
      if (this.controls.diss()) this.fireDiss();
    }

    // entities
    for (const s of this.shells) s.step(hdt, dx);
    this.shells = this.shells.filter((s) => !s.done);
    for (const m of this.mortars) m.step(dt, dx);
    this.mortars = this.mortars.filter((m) => !m.done);
    const stepAll = <T extends Entity>(list: T[], stepDt = dt) => {
      for (const e of list) {
        if (!e.active) continue;
        if (e.scrolls) e.x -= dx;
        e.step(stepDt);
      }
      return list.filter((e) => e.active);
    };
    this.enemies = stepAll(this.enemies, hdt);
    this.hostiles = stepAll(this.hostiles, hdt);
    this.disses = stepAll(this.disses);
    this.pickups = stepAll(this.pickups);
    this.rounds = stepAll(this.rounds);

    this.collide();

    if (this.buff) {
      const frac = (this.buffUntil - this.time.now) / (this.buffUntil - this.buffStart);
      if (frac <= 0) this.endBuff();
      else {
        this.hud.setBuff(GUESTS[this.buff].buff, frac);
        if (this.buff === 'dre' && !p.sinking) {
          p.hp = Math.min(PLAYER.hp, p.hp + 3 * dt);
          p.updateFrame();
        }
      }
    }

    const dissReady = HUD.dissFraction(this.time.now, this.dissReadyAt);
    if (dissReady >= 1 && !this.dissWasReady && !p.sinking && this.hostilesActive) {
      Audio.play('select', { pitch: 1.6 });
      this.fx.adlib(p.x, p.y - 34, 'DISS READY');
    }
    this.dissWasReady = dissReady >= 1;
    this.hud.update({
      hp: p.hp,
      lives: this.run.lives,
      score: this.run.score,
      progress: this.distance / this.length,
      dissReady,
      reload: p.reloadFraction(this.time.now),
      boss: this.boss && !this.boss.dead ? { hp: this.boss.hp, max: this.boss.maxHp } : undefined,
    });
    this.controls.update({ dissReady });
    this.popups.update(dtMs);
    this.ticker.update(dtMs);
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
          if (e.damage(r.power)) this.killed(e);
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
          if (pk instanceof MicPickup) {
            pk.remove();
            this.startGuest();
            continue;
          }
          p.hp = Math.min(PLAYER.hp, p.hp + PICKUP_HEAL);
          p.updateFrame();
          this.fx.floatText(pk.x, pk.y, `+${PICKUP_HEAL} HULL`, COLORS.green);
          Audio.play('pickup');
          pk.remove();
          if (Math.random() < 0.3) this.ticker.trigger('pickup');
        }
      }
    }
  }
}
