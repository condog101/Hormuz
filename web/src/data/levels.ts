import { LEVEL_COUNT } from '../../../shared/progress';

export interface LevelDef {
  n: number;
  name: string;
  brief: string;
  durationS: number;
  /** World scroll speed, px/s. */
  scroll: number;
  /** Nominal width of open water between the two coasts, px. */
  straitWidth: number;
  /** Amplitude of coastline wobble, px. */
  coastNoise: number;
  artillery: {
    /** Distance travelled between emplacements, px (0 = none). */
    spacing: number;
    fireMinMs: number;
    fireMaxMs: number;
    /** Landing spread around the predicted target, px. */
    spread: number;
    /** How well gunners lead a moving ship, 0..1. */
    lead: number;
  };
  boats: {
    intervalMs: number;
    speed: number;
    zigChance: number;
    swarmChance: number;
    swarmMin: number;
    swarmMax: number;
  };
  minesMs: number; // 0 = none
  dronesMs: number;
  batterySpacing: number; // missile batteries, 0 = none
  pickupMs: number;
  boss: boolean;
  /** Final stretch opens into the Gulf of Oman. */
  openWater?: boolean;
}

export const LEVELS: LevelDef[] = [
  {
    n: 1, name: 'INTRO: BANDAR', durationS: 60, scroll: 70, straitWidth: 390, coastNoise: 40,
    brief: 'Track one. The opener. Shore guns are rusty and the boat crews are hungover. Keep the tempo up.',
    artillery: { spacing: 900, fireMinMs: 3800, fireMaxMs: 5200, spread: 70, lead: 0 },
    boats: { intervalMs: 3800, speed: 120, zigChance: 0, swarmChance: 0, swarmMin: 1, swarmMax: 1 },
    minesMs: 0, dronesMs: 0, batterySpacing: 0, pickupMs: 22000, boss: false,
  },
  {
    n: 2, name: 'QESHM DRIVE-BY', durationS: 65, scroll: 75, straitWidth: 370, coastNoise: 48,
    brief: 'More emplacements dug into the island, and they have started to range their guns. Classic drive-by energy. Theirs, not ours.',
    artillery: { spacing: 720, fireMinMs: 3400, fireMaxMs: 4800, spread: 60, lead: 0.2 },
    boats: { intervalMs: 3300, speed: 130, zigChance: 0, swarmChance: 0, swarmMin: 1, swarmMax: 1 },
    minesMs: 0, dronesMs: 0, batterySpacing: 0, pickupMs: 22000, boss: false,
  },
  {
    n: 3, name: 'LARAK SWARM', durationS: 70, scroll: 80, straitWidth: 340, coastNoise: 52,
    brief: 'Swarm tactics reported. Zigzagging boats will try to confuse your gunners. Think of it as a posse cut with too many verses.',
    artillery: { spacing: 640, fireMinMs: 3200, fireMaxMs: 4500, spread: 55, lead: 0.35 },
    boats: { intervalMs: 2900, speed: 140, zigChance: 0.35, swarmChance: 0.15, swarmMin: 4, swarmMax: 5 },
    minesMs: 0, dronesMs: 0, batterySpacing: 0, pickupMs: 20000, boss: false,
  },
  {
    n: 4, name: 'HORMUZ ISLAND', durationS: 75, scroll: 85, straitWidth: 320, coastNoise: 56,
    brief: 'Mines in the lane. Shoot them before they feature on the hull.',
    artillery: { spacing: 600, fireMinMs: 3000, fireMaxMs: 4200, spread: 50, lead: 0.45 },
    boats: { intervalMs: 2700, speed: 145, zigChance: 0.4, swarmChance: 0.2, swarmMin: 4, swarmMax: 5 },
    minesMs: 3600, dronesMs: 0, batterySpacing: 0, pickupMs: 20000, boss: false,
  },
  {
    n: 5, name: 'THE NARROWS', durationS: 80, scroll: 90, straitWidth: 290, coastNoise: 56,
    brief: 'Narrowest point of the strait. Drones overhead. A&R says something big is waiting at the end of the track. They always say that. This time it is true.',
    artillery: { spacing: 560, fireMinMs: 2800, fireMaxMs: 4000, spread: 46, lead: 0.5 },
    boats: { intervalMs: 2500, speed: 150, zigChance: 0.45, swarmChance: 0.22, swarmMin: 4, swarmMax: 6 },
    minesMs: 3400, dronesMs: 6500, batterySpacing: 0, pickupMs: 18000, boss: true,
  },
  {
    n: 6, name: 'MUSANDAM CLIFFS', durationS: 80, scroll: 95, straitWidth: 280, coastNoise: 60,
    brief: 'Cliffs on both sides. Nowhere to hide and nowhere to turn. The acoustics are incredible, which is bad news for a boat.',
    artillery: { spacing: 520, fireMinMs: 2600, fireMaxMs: 3800, spread: 42, lead: 0.55 },
    boats: { intervalMs: 2300, speed: 155, zigChance: 0.5, swarmChance: 0.25, swarmMin: 4, swarmMax: 6 },
    minesMs: 3200, dronesMs: 5800, batterySpacing: 0, pickupMs: 18000, boss: false,
  },
  {
    n: 7, name: 'MISSILE ALLEY', durationS: 85, scroll: 100, straitWidth: 280, coastNoise: 60,
    brief: 'Anti-ship missile batteries online. When the klaxon sounds, CIWS or dodge. The missiles do not care about your flow.',
    artillery: { spacing: 520, fireMinMs: 2500, fireMaxMs: 3600, spread: 40, lead: 0.6 },
    boats: { intervalMs: 2200, speed: 160, zigChance: 0.5, swarmChance: 0.25, swarmMin: 4, swarmMax: 6 },
    minesMs: 3000, dronesMs: 5400, batterySpacing: 1400, pickupMs: 17000, boss: false,
  },
  {
    n: 8, name: 'G.O.A.T. ISLAND', durationS: 85, scroll: 105, straitWidth: 300, coastNoise: 64,
    brief: 'Everything they have, all at once. Big Don insists the island is named after him. The goats disagree.',
    artillery: { spacing: 480, fireMinMs: 2400, fireMaxMs: 3400, spread: 38, lead: 0.65 },
    boats: { intervalMs: 2000, speed: 165, zigChance: 0.55, swarmChance: 0.3, swarmMin: 5, swarmMax: 6 },
    minesMs: 2800, dronesMs: 5000, batterySpacing: 1200, pickupMs: 17000, boss: false,
  },
  {
    n: 9, name: 'RAS AL KUH', durationS: 90, scroll: 110, straitWidth: 320, coastNoise: 64,
    brief: 'Last line of shore defences. Their gunners are the best they have left, so this is the diss track. Make it personal.',
    artillery: { spacing: 450, fireMinMs: 2200, fireMaxMs: 3200, spread: 34, lead: 0.7 },
    boats: { intervalMs: 1900, speed: 170, zigChance: 0.6, swarmChance: 0.3, swarmMin: 5, swarmMax: 6 },
    minesMs: 2600, dronesMs: 4600, batterySpacing: 1100, pickupMs: 16000, boss: false,
  },
  {
    n: 10, name: 'OUTRO: OPEN SEA', durationS: 90, scroll: 115, straitWidth: 360, coastNoise: 56,
    brief: 'Open water is in sight. One more fight with the rival label and the album is done. No skits.',
    artillery: { spacing: 450, fireMinMs: 2100, fireMaxMs: 3000, spread: 32, lead: 0.75 },
    boats: { intervalMs: 1800, speed: 175, zigChance: 0.6, swarmChance: 0.35, swarmMin: 5, swarmMax: 6 },
    minesMs: 2500, dronesMs: 4400, batterySpacing: 1000, pickupMs: 15000, boss: true, openWater: true,
  },
];

export const ENDLESS_START = LEVEL_COUNT + 1;

/** Level definition for any level number; 11+ are hidden tracks (endless waves) that keep scaling. */
export function getLevel(n: number): LevelDef {
  if (n >= 1 && n <= LEVELS.length) return LEVELS[n - 1];
  const base = LEVELS[8]; // level 9 has coastlines on both sides
  const k = n - LEVELS.length; // 1, 2, 3...
  const f = Math.pow(0.95, k);
  return {
    ...base,
    n,
    name: `HIDDEN TRACK ${k}`,
    brief: 'Unlisted. Uncleared. It goes on until you fall off. How long can you hold the strait?',
    durationS: 70,
    scroll: Math.min(150, base.scroll + 3 * k),
    straitWidth: 300,
    artillery: {
      ...base.artillery,
      fireMinMs: Math.max(1200, base.artillery.fireMinMs * f),
      fireMaxMs: Math.max(1800, base.artillery.fireMaxMs * f),
      spread: Math.max(22, base.artillery.spread - k),
      lead: Math.min(0.9, base.artillery.lead + 0.02 * k),
    },
    boats: {
      ...base.boats,
      intervalMs: Math.max(900, base.boats.intervalMs * f),
      speed: Math.min(230, base.boats.speed + 4 * k),
      swarmChance: Math.min(0.5, base.boats.swarmChance + 0.02 * k),
    },
    minesMs: Math.max(1500, base.minesMs * f),
    dronesMs: Math.max(2500, base.dronesMs * f),
    batterySpacing: Math.max(700, base.batterySpacing * f),
    boss: n % 5 === 0,
    openWater: false,
  };
}
