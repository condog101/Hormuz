import { ZZFX, ZZFXSound } from 'zzfx';

// Procedural SFX. Parameter arrays are ZzFX format:
// [volume, randomness, frequency, attack, sustain, release, shape, shapeCurve, slide, deltaSlide,
//  pitchJump, pitchJumpTime, repeatTime, noise, modulation, bitCrush, delay, sustainVolume, decay, tremolo, filter]
const DEFS = {
  shoot: [0.6, 0.05, 220, 0, 0.02, 0.12, 4, 1.6, -9, 0, 0, 0, 0, 0.6, 0, 0.1, 0, 0.6, 0.02],
  ciws: [0.35, 0.05, 900, 0, 0.01, 0.03, 2, 0.4, 0, 0, 0, 0, 0.035, 0.3, 0, 0, 0, 0.8, 0.01],
  // drive-by spray: lower and grittier than the CIWS
  mac: [0.4, 0.05, 480, 0, 0.012, 0.045, 4, 0.6, 0, 0, 0, 0, 0.03, 0.9, 0, 0.35, 0, 0.7, 0.01],
  // lowrider horn: two tones, high then low
  horn: [0.45, 0, 494, 0.01, 0.14, 0.06, 2, 1, 0, 0, -102, 0.09, 0, 0, 0, 0, 0, 0.9],
  boom: [1, 0.1, 70, 0.01, 0.15, 0.6, 4, 0.5, -1, 0, 0, 0, 0, 1.6, 0, 0.4, 0, 0.5, 0.15],
  bigBoom: [1.4, 0.1, 50, 0.02, 0.3, 1.1, 4, 0.5, -0.5, 0, 0, 0, 0, 2, 0, 0.5, 0.1, 0.4, 0.25],
  // shotgun: a short, higher-pitched cousin of boom
  pump: [0.8, 0.1, 140, 0.005, 0.05, 0.18, 4, 0.5, -2, 0, 0, 0, 0, 1.4, 0, 0.3, 0, 0.5, 0.06],
  splash: [0.5, 0.2, 400, 0.01, 0.05, 0.3, 4, 0, -2, 0, 0, 0, 0, 3, 0, 0, 0, 0.4, 0.1],
  hit: [1, 0.05, 140, 0, 0.08, 0.3, 3, 2, -6, 0, 0, 0, 0, 1.2, 0, 0.3, 0, 0.6],
  whistle: [0.18, 0, 1400, 0.05, 0.6, 0.4, 0, 1, -2.5, 0, 0, 0, 0, 0, 0, 0, 0, 0.8],
  // record scratch: filtered noise with a fast up/down pitch sweep
  incoming: [0.7, 0.2, 700, 0.005, 0.07, 0.12, 4, 1.5, -24, 60, 0, 0, 0.05, 1.6, 0, 0.3, 0, 0.7, 0.02],
  klaxon: [0.5, 0, 420, 0.02, 0.25, 0.05, 2, 1, 0, 0, -120, 0.15, 0.3, 0, 0, 0, 0, 0.9],
  pickup: [0.6, 0, 520, 0, 0.06, 0.25, 0, 1.4, 0, 0, 400, 0.06, 0, 0, 0, 0, 0, 0.8],
  // air horn: sawtooth with an upward pitch jump and a little modulation grit (played x3)
  clear: [0.7, 0, 311, 0.03, 0.22, 0.14, 2, 1, 0, 0, 155, 0.05, 0, 0, 18, 0, 0, 0.9, 0.04],
  // falling tone under the scratch (`incoming` is layered on top in play())
  death: [1, 0.05, 220, 0.05, 0.55, 1.1, 1, 1, -5, 0, 0, 0, 0, 0.4, 0, 0.3, 0.2, 0.6, 0.3],
  // vinyl click
  select: [0.45, 0.1, 2400, 0, 0.004, 0.03, 4, 2, 0, 0, 0, 0, 0, 1, 0, 0.2],
  blip: [0.2, 0, 1200, 0, 0.005, 0.02, 1],
  // Censor tone: 1 kHz sine, held; retriggered while the typewriter is inside a bleeped word.
  bleep: [0.5, 0, 1000, 0.005, 0.25, 0.02, 0],
  launch: [0.6, 0.1, 300, 0.05, 0.3, 0.4, 4, 1, 4, 0, 0, 0, 0, 1.5, 0, 0, 0, 0.6],
  // deeper air horn (played x3)
  bossAlarm: [0.8, 0, 220, 0.03, 0.3, 0.2, 2, 1, 0, 0, 110, 0.07, 0, 0, 22, 0, 0, 0.9, 0.05],
} satisfies Record<string, number[]>;

export type Sfx = keyof typeof DEFS;

/** Sounds that re-fire: [count, gap ms]. Air horns come in threes. */
const REPEATS: Partial<Record<Sfx, [number, number]>> = { clear: [3, 300], bossAlarm: [3, 360] };
/** Sounds layered on top of another. */
const LAYERS: Partial<Record<Sfx, Sfx>> = { death: 'incoming' };

class AudioSystem {
  private sounds = new Map<Sfx, ZZFXSound>();
  private lastPlayed = new Map<Sfx, number>();
  private volume = 0.6;

  private get(name: Sfx): ZZFXSound {
    let s = this.sounds.get(name);
    if (!s) {
      s = new ZZFXSound(DEFS[name]);
      this.sounds.set(name, s);
    }
    return s;
  }

  setVolume(v: number) {
    this.volume = v;
    ZZFX.volume = 0.3 * v;
  }

  getVolume() {
    return this.volume;
  }

  /** Browsers start the AudioContext suspended until a user gesture. */
  unlock() {
    if (ZZFX.audioContext.state !== 'running') void ZZFX.audioContext.resume();
  }

  play(name: Sfx, opts: { volume?: number; pitch?: number; pan?: number; minGapMs?: number } = {}) {
    if (this.volume <= 0 || ZZFX.audioContext.state !== 'running') return;
    const now = performance.now();
    const gap = opts.minGapMs ?? 30;
    if (now - (this.lastPlayed.get(name) ?? 0) < gap) return;
    this.lastPlayed.set(name, now);
    this.get(name).play(opts.volume ?? 1, opts.pitch ?? 1, 1, opts.pan ?? 0);
    const layer = LAYERS[name];
    if (layer) this.get(layer).play(opts.volume ?? 1, 0.8, 1, opts.pan ?? 0);
    const rep = REPEATS[name];
    if (rep) {
      for (let i = 1; i < rep[0]; i++) {
        setTimeout(() => this.get(name).play(opts.volume ?? 1, (opts.pitch ?? 1) * (i === rep[0] - 1 ? 1.06 : 1), 1, opts.pan ?? 0), rep[1] * i);
      }
    }
  }

  /** Pre-render every sound so the first explosion doesn't hitch. */
  warm() {
    for (const k of Object.keys(DEFS) as Sfx[]) this.get(k);
  }
}

export const Audio = new AudioSystem();
