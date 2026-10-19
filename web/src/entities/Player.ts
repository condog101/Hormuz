import Phaser from 'phaser';
import { DEPTH, PLAYER, PX } from '../data/balance';
import type { GameScene } from '../scenes/Game';

export class Player extends Phaser.GameObjects.Sprite {
  hp = PLAYER.hp;
  turret: Phaser.GameObjects.Sprite;
  invulnUntil = 0;
  sinking = false;
  flank = false;
  /** Fire cooldown multiplier (the Ice Cube feature halves it). */
  fireMult = 1;
  /** While set, the ship wears this tint instead of the invulnerability flicker. */
  buffTint: number | null = null;
  private fireReadyAt = 0;
  private lastCooldownMs = 1;
  private bobT = 0;
  private wake: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(private scene_: GameScene, x: number, y: number) {
    super(scene_, x, y, 'destroyer', 0);
    this.setScale(PX).setDepth(DEPTH.player);
    scene_.add.existing(this);
    this.turret = scene_.add.sprite(x, y, 'turret').setScale(PX).setDepth(DEPTH.player + 1);
    this.wake = scene_.add.particles(0, 0, 'px', {
      lifespan: 900,
      speedX: { min: -90, max: -60 },
      speedY: { min: -18, max: 18 },
      scale: { start: 2.5, end: 0.5 },
      alpha: { start: 0.7, end: 0 },
      frequency: 30,
      tint: [0xffffff, 0xd8f0ff],
    });
    this.wake.setDepth(DEPTH.sea - 1);
  }

  get muzzle(): { x: number; y: number } {
    const p = this.turretPos;
    return {
      x: p.x + Math.cos(this.turret.rotation) * PLAYER.muzzleLength,
      y: p.y + Math.sin(this.turret.rotation) * PLAYER.muzzleLength,
    };
  }

  get turretPos(): { x: number; y: number } {
    return { x: this.x + PLAYER.turretOffsetX, y: this.y };
  }

  get invulnerable(): boolean {
    return this.sinking || this.scene_.time.now < this.invulnUntil;
  }

  step(dt: number, move: { x: number; y: number }, aim: number, flank: boolean) {
    if (this.sinking) return;
    this.flank = flank && (move.x !== 0 || move.y !== 0);
    const speed = this.flank ? PLAYER.flankSpeed : PLAYER.speed;
    this.x = Phaser.Math.Clamp(this.x + move.x * speed * dt, PLAYER.minX, PLAYER.maxX);
    const halfW = 30;
    const [top, bot] = this.scene_.coast.waterBand(this.x - halfW, this.x + halfW);
    this.y = Phaser.Math.Clamp(this.y + move.y * speed * dt, top + 18, bot - 18);
    this.updateFrame();
    // hydraulics: bounce the drawn sprite (not the hitbox) while on flank speed
    this.bobT += dt;
    const bob = this.flank ? Math.sin(this.bobT * 16) * 3 : 0;
    this.setOrigin(0.5, 0.5 - bob / this.displayHeight);
    const t = this.turretPos;
    this.turret.setPosition(t.x, t.y + bob).setRotation(aim);
    this.wake.setPosition(this.x - 58, this.y);
    this.wake.frequency = this.flank ? 10 : 30;
    if (this.buffTint !== null) {
      this.alpha = 1;
      this.setTint(this.buffTint);
      this.turret.setTint(this.buffTint);
    } else {
      this.alpha = this.invulnerable && Math.floor(this.scene_.time.now / 90) % 2 === 0 ? 0.45 : 1;
    }
    this.turret.alpha = this.alpha;
  }

  updateFrame() {
    if (this.sinking) return;
    this.setFrame(this.hp > 66 ? 0 : this.hp > 33 ? 1 : 2);
  }

  canFire(now: number, cooldownMs: number): boolean {
    if (this.sinking || now < this.fireReadyAt) return false;
    this.lastCooldownMs = cooldownMs * this.fireMult;
    this.fireReadyAt = now + this.lastCooldownMs;
    return true;
  }

  /** 0 right after a shot, 1 when the gun is ready again (for the HUD). */
  reloadFraction(now: number): number {
    return 1 - Math.max(0, this.fireReadyAt - now) / this.lastCooldownMs;
  }

  sink(onDone: () => void) {
    this.sinking = true;
    this.setOrigin(0.5);
    this.turret.setVisible(false);
    this.wake.stop();
    this.alpha = 1;
    this.play('destroyer_sink');
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, onDone);
  }

  respawn(x: number, y: number) {
    this.sinking = false;
    this.hp = PLAYER.hp;
    this.setPosition(x, y).setFrame(0);
    this.turret.setVisible(true);
    this.wake.start();
    this.invulnUntil = this.scene_.time.now + PLAYER.invulnMs;
  }
}
