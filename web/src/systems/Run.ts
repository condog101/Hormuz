import { PLAYER, type WeaponKey } from '../data/balance';
import { ENDLESS_START } from '../data/levels';
import type { GuestKey } from '../data/quotes';

/** State carried across scenes for one play session (campaign or endless). */
export interface RunState {
  mode: 'campaign' | 'endless';
  startLevel: number;
  level: number;
  score: number;
  lives: number;
  kills: number;
  playMs: number;
  /** The last guest feature, so the next one is the other guest. */
  lastGuest?: GuestKey;
  /** Main gun in hand; carries over from track to track. */
  weapon: WeaponKey;
  /** Big Don has commented on a weapon switch this run. */
  switchedWeapon?: boolean;
}

export function newRun(mode: RunState['mode'], startLevel: number): RunState {
  return {
    mode,
    startLevel: mode === 'endless' ? ENDLESS_START : startLevel,
    level: mode === 'endless' ? ENDLESS_START : startLevel,
    score: 0,
    lives: PLAYER.lives,
    kills: 0,
    playMs: 0,
    weapon: 'nine',
  };
}
