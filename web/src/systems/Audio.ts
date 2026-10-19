import { ZZFX, ZZFXSound } from 'zzfx';

// Procedural SFX. Parameter arrays are ZzFX format:
// [volume, randomness, frequency, attack, sustain, release, shape, shapeCurve, slide, deltaSlide,
//  pitchJump, pitchJumpTime, repeatTime, noise, modulation, bitCrush, delay, sustainVolume, decay, tremolo, filter]
const DEFS = {
  shoot: [0.6, 0.05, 220, 0, 0.02, 0.12, 4, 1.6, -9, 0, 0, 0, 0, 0.6, 0, 0.1, 0, 0.6, 0.02],
  ciws: [0.35, 0.05, 900, 0, 0.01, 0.03, 2, 0.4, 0, 0, 0, 0, 0.035, 0.3, 0, 0, 0, 0.8, 0.01],
  boom: [1, 0.1, 70, 0.01, 0.15, 0.6, 4, 0.5, -1, 0, 0, 0, 0, 1.6, 0, 0.4, 0, 0.5, 0.15],
  bigBoom: [1.4, 0.1, 50, 0.02, 0.3, 1.1, 4, 0.5, -0.5, 0, 0, 0, 0, 2, 0, 0.5, 0.1, 0.4, 0.25],
  splash: [0.5, 0.2, 400, 0.01, 0.05, 0.3, 4, 0, -2, 0, 0, 0, 0, 3, 0, 0, 0, 0.4, 0.1],
  hit: [1, 0.05, 140, 0, 0.08, 0.3, 3, 2, -6, 0, 0, 0, 0, 1.2, 0, 0.3, 0, 0.6],
  whistle: [0.18, 0, 1400, 0.05, 0.6, 0.4, 0, 1, -2.5, 0, 0, 0, 0, 0, 0, 0, 0, 0.8],
  incoming: [0.5, 0, 660, 0, 0.08, 0.08, 1, 1, 0, 0, 220, 0.08, 0.16, 0, 0, 0, 0, 0.7],
  klaxon: [0.5, 0, 420, 0.02, 0.25, 0.05, 2, 1, 0, 0, -120, 0.15, 0.3, 0, 0, 0, 0, 0.9],
  pickup: [0.6, 0, 520, 0, 0.06, 0.25, 0, 1.4, 0, 0, 400, 0.06, 0, 0, 0, 0, 0, 0.8],
  clear: [0.6, 0, 392, 0.02, 0.3, 0.5, 1, 1, 0, 0, 196, 0.12, 0.12, 0, 0, 0, 0, 0.8],
  death: [1, 0.05, 110, 0.05, 0.6, 1.2, 4, 0.8, -1, 0, 0, 0, 0, 1, 0, 0.3, 0.2, 0.5, 0.3],
  select: [0.4, 0, 880, 0, 0.02, 0.05, 1, 1, 0, 0, 440, 0.03],
  blip: [0.2, 0, 1200, 0, 0.005, 0.02, 1],
  launch: [0.6, 0.1, 300, 0.05, 0.3, 0.4, 4, 1, 4, 0, 0, 0, 0, 1.5, 0, 0, 0, 0.6],
  bossAlarm: [0.6, 0, 200, 0.05, 0.4, 0.2, 2, 1, 0, 0, 100, 0.2, 0.25, 0, 0, 0, 0, 0.9],
} satisfies Record<string, number[]>;

export type Sfx = keyof typeof DEFS;

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
  }

  /** Pre-render every sound so the first explosion doesn't hitch. */
  warm() {
    for (const k of Object.keys(DEFS) as Sfx[]) this.get(k);
  }
}

export const Audio = new AudioSystem();
