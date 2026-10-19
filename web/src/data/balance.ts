// Tunable numbers that aren't per-level. Per-level difficulty lives in levels.ts.

export const WIDTH = 960;
export const HEIGHT = 540;
/** Every sprite is drawn at this integer scale. */
export const PX = 2;
export const TILE = 16 * PX;

export const PLAYER = {
  speed: 170,
  flankSpeed: 265,
  minX: 70,
  maxX: 720,
  hp: 100,
  lives: 3,
  invulnMs: 2200,
  turretOffsetX: 14 * PX, // pivot (46,12) in a 64x24 frame, relative to the centre
  muzzleLength: 6 * PX,
  hitRadius: 18,
  /** Flank speed makes the ship easier to spot: artillery spread is multiplied by this. */
  flankAccuracyMult: 0.6,
};

export type WeaponKey = 'nine' | 'pump' | 'boom';

export interface Weapon {
  name: string;
  /** Frame in hud_icons.png. */
  icon: number;
  cooldownMs: number;
  /** Projectiles per shot. */
  shots: number;
  /** Half-angle of the random spread (nine) or of the even fan (pump), rad. */
  spread: number;
  damage: number;
  /** Round speed, px/s (rounds only). */
  speed: number;
  /** Rounds expire after this many seconds (pump pellets). */
  ttlS?: number;
  /** Blast radius, max lob range and flight time (the 808 only). */
  radius?: number;
  range?: number;
  flightMs?: number;
}

/** Main-gun weapons, switched at will. THE NINE is the default. */
export const WEAPONS: Record<WeaponKey, Weapon> = {
  nine: { name: 'THE NINE', icon: 6, cooldownMs: 80, shots: 1, spread: 0.06, damage: 1, speed: 700 },
  pump: { name: 'THE PUMP', icon: 7, cooldownMs: 520, shots: 6, spread: 0.32, damage: 1, speed: 560, ttlS: 0.45 },
  boom: { name: 'THE 808', icon: 8, cooldownMs: 900, shots: 1, spread: 0, damage: 2, speed: 0, radius: 70, range: 380, flightMs: 500 },
};

export const WEAPON_ORDER: WeaponKey[] = ['nine', 'pump', 'boom'];

export const CIWS = {
  cooldownMs: 4200,
  range: 260,
  maxTargets: 3,
  burstMs: 160, // per target
};

export const DAMAGE = {
  shell: 22,
  boat: 24,
  mine: 30,
  drone: 26,
  missile: 34,
  bossGun: 12,
  driveBy: 7,
};

export const PICKUP_HEAL = 30;

export const POPUP = {
  minGapMs: 30_000,
  maxGapMs: 55_000,
  typeMs: 4000,
  holdMs: 2600,
  damageChance: 0.3,
  contextCooldownMs: 12_000,
};

export const DEPTH = {
  water: 0,
  land: 10,
  ground: 20, // emplacements
  shadow: 25,
  sea: 30, // boats, mines, pickups
  player: 40,
  air: 50, // shells, drones, missiles
  fx: 60,
  hud: 100,
  popup: 200,
};
