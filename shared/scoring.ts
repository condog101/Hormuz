// Score values and the plausibility bound the Worker uses to reject forged runs.

export const KILL_POINTS = {
  boat: 100,
  boatZig: 150,
  artillery: 300,
  mine: 50,
  drone: 200,
  missile: 250,
  battery: 400,
  boss: 5000,
} as const;

export type KillKind = keyof typeof KILL_POINTS;

export const LEVEL_CLEAR_BONUS = 1000; // multiplied by level number
export const NO_DAMAGE_BONUS = 2000;
export const HP_BONUS_PER_POINT = 10; // remaining hull HP at level clear
export const MAX_HP = 100;

/** Bonus awarded for clearing `level` with `hp` hull left. */
export function levelClearBonus(level: number, hp: number, tookDamage: boolean): number {
  return LEVEL_CLEAR_BONUS * level + (tookDamage ? 0 : NO_DAMAGE_BONUS) + Math.max(0, hp) * HP_BONUS_PER_POINT;
}

// Generous ceiling on kill points per second of play. Real play peaks well below this.
export const MAX_KILL_POINTS_PER_SEC = 500;
// Bosses appear on levels 5 and 10, then every 5th endless wave.
const bossesThrough = (level: number) => Math.floor(level / 5);

/** Highest score a legitimate run could reach by `levelReached` in `durationMs`. */
export function maxPlausibleScore(levelReached: number, durationMs: number): number {
  const lvl = Math.max(1, Math.floor(levelReached));
  const secs = Math.max(0, durationMs) / 1000;
  let bonuses = 0;
  for (let l = 1; l <= lvl; l++) bonuses += levelClearBonus(l, MAX_HP, false);
  return Math.ceil(bonuses + bossesThrough(lvl) * KILL_POINTS.boss + secs * MAX_KILL_POINTS_PER_SEC);
}

/** Shortest a run reaching `levelReached` could possibly take (levels are >= 60s each). */
export const MIN_LEVEL_DURATION_MS = 55_000;

export function isPlausibleRun(run: { score: number; levelReached: number; durationMs: number; kills: number }): boolean {
  const { score, levelReached, durationMs, kills } = run;
  if (![score, levelReached, durationMs, kills].every((n) => Number.isInteger(n) && n >= 0)) return false;
  if (levelReached < 1 || levelReached > 999) return false;
  if (durationMs > 6 * 60 * 60 * 1000) return false;
  // Reaching level N means clearing N-1 levels, each of which has a minimum length.
  if (durationMs < (levelReached - 1) * MIN_LEVEL_DURATION_MS) return false;
  if (kills > (durationMs / 1000) * 10 + 10) return false;
  return score <= maxPlausibleScore(levelReached, durationMs);
}
