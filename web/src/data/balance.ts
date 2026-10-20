// Tunable numbers that aren't per-level. Per-level difficulty lives in levels.ts.

import { TOUCH } from '../systems/Device';

export const HEIGHT = 540;

/**
 * Canvas width. Desktop is 960x540 (16:9). Phones are wider than 16:9, so on touch the canvas
 * widens to the screen's landscape aspect (inside the safe area) instead of letterboxing.
 */
function gameWidth(): number {
  if (!TOUCH || typeof document === 'undefined') return 960;
  const el = document.getElementById('game');
  if (!el) return 960;
  const w = el.clientWidth;
  const h = el.clientHeight;
  if (!(w > 0 && h > 0)) return 960;
  // Long side over short side: a phone held in portrait at load still sizes for landscape play.
  const aspect = Math.max(w, h) / Math.min(w, h);
  return Math.min(1280, Math.max(960, Math.round((HEIGHT * aspect) / 2) * 2));
}

export const WIDTH = gameWidth();
/** How far a 960-wide layout shifts right to sit centred on the canvas. */
export const OX = (WIDTH - 960) / 2;
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

/** DISS TRACKS: a rechargeable salvo of guided missiles that lock the nearest opps. */
export const DISS = {
  rechargeMs: 12_000,
  count: 5,
  /** Only opps this close to the ship get locked. */
  range: 600,
  damage: 4,
  blastRadius: 30,
  speed: 420,
  accel: 700,
  /** Max turn, rad/s. */
  turnRate: 5.5,
  launchGapMs: 140,
  ttlS: 3.5,
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
