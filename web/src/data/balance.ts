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
  fireCooldownMs: 210,
  roundSpeed: 620,
  hitRadius: 18,
  /** Flank speed makes the ship easier to spot: artillery spread is multiplied by this. */
  flankAccuracyMult: 0.6,
};

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
