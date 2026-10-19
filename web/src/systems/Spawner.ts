import { WIDTH } from '../data/balance';
import type { LevelDef } from '../data/levels';
import { Artillery } from '../entities/Artillery';
import { Battery } from '../entities/Battery';
import { Drone } from '../entities/Drone';
import { Mine } from '../entities/Mine';
import { Pickup } from '../entities/Pickup';
import type { GameScene } from '../scenes/Game';
import { chance, rand, randInt } from './Random';

/** Turns the level table into spawns, keyed on distance (shore) and time (sea/air). */
export class Spawner {
  active = true;
  private nextArtillery: number;
  private nextBattery: number;
  private timers: Record<'boat' | 'mine' | 'drone' | 'pickup', number>;

  constructor(private g: GameScene, private level: LevelDef) {
    this.nextArtillery = level.artillery.spacing * 0.5;
    this.nextBattery = level.batterySpacing > 0 ? level.batterySpacing * 0.8 : Infinity;
    this.timers = {
      boat: 1800,
      mine: level.minesMs ? level.minesMs : Infinity,
      drone: level.dronesMs ? level.dronesMs * 0.8 : Infinity,
      pickup: level.pickupMs,
    };
  }

  update(dtMs: number, distance: number) {
    if (!this.active) return;
    const L = this.level;
    if (L.artillery.spacing > 0 && distance >= this.nextArtillery) {
      this.nextArtillery += L.artillery.spacing * rand(0.75, 1.25);
      this.placeShore((x, y, north) => new Artillery(this.g, x, y, north));
    }
    if (distance >= this.nextBattery) {
      this.nextBattery += L.batterySpacing * rand(0.8, 1.2);
      this.placeShore((x, y, north) => new Battery(this.g, x, y, north));
    }
    for (const k of Object.keys(this.timers) as (keyof typeof this.timers)[]) {
      this.timers[k] -= dtMs;
      if (this.timers[k] <= 0) this.fire(k);
    }
  }

  private placeShore(make: (x: number, y: number, north: boolean) => Artillery | Battery) {
    const x = WIDTH + 30;
    const sides: ('top' | 'bot')[] = chance(0.5) ? ['top', 'bot'] : ['bot', 'top'];
    for (const side of sides) {
      const y = this.g.coast.emplacementSpot(x, side);
      if (y !== null) {
        this.g.addEnemy(make(x, y, side === 'top'));
        return;
      }
    }
  }

  private waterY(x: number, margin = 30): number {
    const [top, bot] = this.g.coast.waterBand(x - 16, x + 16);
    return rand(top + margin, Math.max(top + margin, bot - margin));
  }

  private fire(kind: keyof typeof this.timers) {
    const L = this.level;
    switch (kind) {
      case 'boat': {
        this.timers.boat = L.boats.intervalMs * rand(0.7, 1.3);
        const swarm = chance(L.boats.swarmChance);
        const n = swarm ? randInt(L.boats.swarmMin, L.boats.swarmMax) : 1;
        const fromCove = chance(0.5);
        const x = fromCove ? rand(WIDTH * 0.55, WIDTH - 20) : WIDTH + 30;
        const north = chance(0.5);
        for (let i = 0; i < n; i++) {
          const zig = chance(L.boats.zigChance);
          if (fromCove) {
            const bx = x + i * 22;
            const y = north ? this.g.coast.topEdge(bx) - 6 : this.g.coast.botEdge(bx) + 6;
            this.g.spawnBoat(bx, y, north ? Math.PI / 2 : -Math.PI / 2, zig);
          } else {
            this.g.spawnBoat(x + i * 26, this.waterY(x), Math.PI, zig);
          }
        }
        break;
      }
      case 'mine':
        this.timers.mine = L.minesMs * rand(0.7, 1.3);
        this.g.addEnemy(new Mine(this.g, WIDTH + 20, this.waterY(WIDTH, 24)));
        break;
      case 'drone':
        this.timers.drone = L.dronesMs * rand(0.7, 1.3);
        this.g.addEnemy(new Drone(this.g, rand(WIDTH * 0.45, WIDTH - 40), -24));
        break;
      case 'pickup':
        this.timers.pickup = L.pickupMs * rand(0.8, 1.2);
        this.g.addPickup(new Pickup(this.g, WIDTH + 20, this.waterY(WIDTH, 40)));
        break;
    }
  }
}
