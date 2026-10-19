import { PLAYER } from '../data/balance';
import { ENDLESS_START } from '../data/levels';

/** State carried across scenes for one play session (campaign or endless). */
export interface RunState {
  mode: 'campaign' | 'endless';
  startLevel: number;
  level: number;
  score: number;
  lives: number;
  kills: number;
  playMs: number;
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
  };
}
