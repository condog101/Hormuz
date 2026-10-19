import { describe, expect, it } from 'vitest';
import { LEVEL_COUNT } from '../shared/progress';
import { isPlausibleRun, levelClearBonus, MAX_HP } from '../shared/scoring';
import { ENDLESS_START, getLevel, LEVELS } from '../web/src/data/levels';

describe('level table', () => {
  it('has one entry per campaign level, numbered in order', () => {
    expect(LEVELS).toHaveLength(LEVEL_COUNT);
    LEVELS.forEach((l, i) => expect(l.n).toBe(i + 1));
  });

  it('every level has sane ranges', () => {
    for (const l of LEVELS) {
      expect(l.durationS).toBeGreaterThanOrEqual(60);
      expect(l.durationS).toBeLessThanOrEqual(90);
      expect(l.scroll).toBeGreaterThan(0);
      expect(l.straitWidth).toBeGreaterThanOrEqual(240);
      expect(l.straitWidth).toBeLessThanOrEqual(412);
      expect(l.artillery.fireMinMs).toBeLessThanOrEqual(l.artillery.fireMaxMs);
      expect(l.artillery.lead).toBeGreaterThanOrEqual(0);
      expect(l.artillery.lead).toBeLessThanOrEqual(1);
      expect(l.boats.swarmMin).toBeLessThanOrEqual(l.boats.swarmMax);
      expect(l.boats.zigChance).toBeGreaterThanOrEqual(0);
      expect(l.boats.zigChance).toBeLessThanOrEqual(1);
    }
  });

  it('difficulty never decreases from one level to the next', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      const a = LEVELS[i - 1];
      const b = LEVELS[i];
      expect(b.scroll).toBeGreaterThanOrEqual(a.scroll);
      expect(b.boats.intervalMs).toBeLessThanOrEqual(a.boats.intervalMs);
      expect(b.boats.speed).toBeGreaterThanOrEqual(a.boats.speed);
      expect(b.artillery.fireMinMs).toBeLessThanOrEqual(a.artillery.fireMinMs);
      expect(b.artillery.spread).toBeLessThanOrEqual(a.artillery.spread);
      expect(b.artillery.lead).toBeGreaterThanOrEqual(a.artillery.lead);
      if (a.driveByMs > 0 && b.driveByMs > 0) expect(b.driveByMs).toBeLessThanOrEqual(a.driveByMs);
    }
  });

  it('introduces enemy types on schedule', () => {
    const first = (pred: (n: number) => boolean) => LEVELS.find((l) => pred(l.n))?.n;
    expect(first((n) => getLevel(n).boats.zigChance > 0)).toBe(3);
    expect(first((n) => getLevel(n).minesMs > 0)).toBe(4);
    expect(first((n) => getLevel(n).dronesMs > 0)).toBe(5);
    expect(first((n) => getLevel(n).batterySpacing > 0)).toBe(7);
    expect(first((n) => getLevel(n).driveByMs > 0)).toBe(2);
    expect(LEVELS.filter((l) => l.boss).map((l) => l.n)).toEqual([5, 10]);
    expect(LEVELS[9].openWater).toBe(true);
  });

  it('endless waves keep scaling and bosses every 5th', () => {
    let prev = getLevel(ENDLESS_START);
    expect(prev.n).toBe(11);
    for (let n = ENDLESS_START + 1; n < ENDLESS_START + 40; n++) {
      const l = getLevel(n);
      expect(l.boats.intervalMs).toBeLessThanOrEqual(prev.boats.intervalMs);
      expect(l.scroll).toBeGreaterThanOrEqual(prev.scroll);
      expect(l.boss).toBe(n % 5 === 0);
      prev = l;
    }
  });

  it('a perfect, fast legitimate campaign passes the server plausibility check', () => {
    let score = 0;
    let ms = 0;
    for (const l of LEVELS) {
      ms += l.durationS * 1000;
      score += levelClearBonus(l.n, MAX_HP, false) + (l.boss ? 5000 : 0) + l.durationS * 250;
    }
    expect(isPlausibleRun({ score, startLevel: 1, levelReached: 10, durationMs: ms, kills: 400 })).toBe(true);
  });
});
