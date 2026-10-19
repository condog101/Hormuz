declare module 'zzfx' {
  export const ZZFX: {
    volume: number;
    audioContext: AudioContext;
  };
  export function zzfx(...params: (number | undefined)[]): AudioBufferSourceNode;
  export class ZZFXSound {
    constructor(params: (number | undefined)[]);
    play(volume?: number, pitch?: number, randomnessScale?: number, pan?: number, loop?: boolean): AudioBufferSourceNode;
    stop(): void;
  }
}
