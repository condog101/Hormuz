import { describe, expect, it } from 'vitest';
import { LEVEL_COUNT } from '../shared/progress';
import { GUESTS, QUOTES, type QuoteTag } from '../web/src/data/quotes';
import { BEATS, ENDING, TWEETS, type InputText } from '../web/src/data/story';

const TAGS: QuoteTag[] = [
  'random', 'start', 'damage', 'lowHull', 'bossIntro', 'boss', 'death', 'clear',
  'victory', 'streak', 'pickup', 'ciws', 'driveBy', 'weapon', 'diss',
];

const exchanges = Object.values(GUESTS).flatMap((g) => g.exchanges);
const inGame = [
  ...QUOTES.map((q) => q.text),
  ...exchanges.flatMap((e) => [e.guest, e.don]),
  ...BEATS.flatMap((b) => [b.line, b.don]),
];
const variants = (t: InputText) => (typeof t === 'string' ? [t] : [t.desktop, t.touch]);
const tweets = [...Object.values(TWEETS).flat(), ...ENDING];

describe('line bank', () => {
  it('every in-game line fits the phone card (150 chars)', () => {
    for (const line of inGame) expect(line.length, line).toBeLessThanOrEqual(150);
  });

  it('bleeped words are single tokens', () => {
    for (const line of [...inGame, ...tweets.flatMap((t) => variants(t.text))]) {
      for (const m of line.matchAll(/\{([^}]*)\}/g)) expect(m[1], line).not.toMatch(/\s/);
    }
  });

  it('never uses a raw asterisk (the typewriter reads * as a bleep)', () => {
    for (const line of [...inGame, ...tweets.flatMap((t) => [...variants(t.text), t.reply?.text ?? ''])]) expect(line, line).not.toContain('*');
  });

  it('has at least three lines per tag', () => {
    for (const tag of TAGS) expect(QUOTES.filter((q) => q.tags.includes(tag)).length, tag).toBeGreaterThanOrEqual(3);
  });

  it('every guest has six exchanges and a distinct portrait', () => {
    for (const g of Object.values(GUESTS)) expect(g.exchanges).toHaveLength(6);
    expect(new Set(Object.values(GUESTS).map((g) => g.frame)).size).toBe(Object.keys(GUESTS).length);
  });
});

describe('story', () => {
  it('briefings only exist for campaign tracks', () => {
    for (const k of Object.keys(TWEETS).map(Number)) {
      expect(k).toBeGreaterThanOrEqual(1);
      expect(k).toBeLessThanOrEqual(LEVEL_COUNT);
    }
  });

  it('tweets and replies stay short', () => {
    for (const t of tweets) {
      for (const v of variants(t.text)) expect(v.length, v).toBeLessThanOrEqual(220);
      if (t.reply) expect(t.reply.text.length, t.reply.text).toBeLessThanOrEqual(120);
    }
  });

  it('beats land on real tracks', () => {
    for (const b of BEATS) {
      expect(b.level).toBeGreaterThanOrEqual(1);
      expect(b.level).toBeLessThanOrEqual(LEVEL_COUNT);
      if (b.at !== 'boss') expect(b.at).toBeGreaterThan(0);
      if (b.at !== 'boss') expect(b.at).toBeLessThan(1);
    }
  });
});
