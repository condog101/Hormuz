import Phaser from 'phaser';
import { DEPTH, HEIGHT, PX, TILE, WIDTH } from '../data/balance';
import type { LevelDef } from '../data/levels';
import { fbm, noise1d } from './Random';

// Tile frames in tiles.png
const T = {
  water: [0, 1, 2, 3],
  sand: 4,
  dune: 5,
  rock: 6,
  rockDark: 7,
  shoreN: 8,
  shoreS: 9,
  cliffN: 10,
  cliffS: 11,
  scrub: 12,
  village: 13,
  shallow: 14,
  foam: 15,
  road: 16,
  roadCarRed: 17,
  roadCarBlue: 18,
  palm: 19,
  tagA: 20,
  tagB: 21,
  billboard: 22,
};

const MIN_WATER = 200;
const MIN_ROWS = 2;

interface Column {
  top: number; // land rows from the top edge (incl. shoreline tile)
  bot: number; // land rows from the bottom edge
  cliffTop: boolean;
  cliffBot: boolean;
}

/**
 * Procedural coastlines: Iran along the top, Musandam along the bottom. Each 16px
 * column of the level gets a land depth from seeded noise; the land is painted with
 * pooled tile images in a container that scrolls, recycled as columns leave the screen.
 */
export class Coastline {
  scrollX = 0;
  private water: Phaser.GameObjects.TileSprite;
  private land: Phaser.GameObjects.Container;
  private live = new Map<number, Phaser.GameObjects.Image[]>();
  private pool: Phaser.GameObjects.Image[] = [];
  private cache = new Map<number, Column>();
  private waterFrame = 0;
  private waterTimer = 0;
  private seed: number;

  constructor(
    scene: Phaser.Scene,
    private level: LevelDef,
    private levelLength: number,
  ) {
    this.seed = level.n * 7919 + 13;
    this.water = scene.add
      .tileSprite(0, 0, WIDTH, HEIGHT, 'tiles', 0)
      .setOrigin(0)
      .setTileScale(PX)
      .setDepth(DEPTH.water);
    this.land = scene.add.container(0, 0).setDepth(DEPTH.land);
    this.refresh();
  }

  column(c: number): Column {
    let col = this.cache.get(c);
    if (col) return col;
    const lvl = this.level;
    const half = (HEIGHT - lvl.straitWidth) / 2;
    const x = c * TILE;
    let top = (half + fbm(x, this.seed, 420) * lvl.coastNoise) / TILE;
    let bot = (half + fbm(x, this.seed + 57, 380) * lvl.coastNoise) / TILE;
    top = Math.max(MIN_ROWS, Math.round(top));
    bot = Math.max(MIN_ROWS, Math.round(bot));
    const maxRows = Math.floor((HEIGHT - MIN_WATER) / TILE);
    while (top + bot > maxRows) {
      if (top >= bot) top--;
      else bot--;
    }
    if (lvl.openWater) {
      // The final stretch of the campaign opens into the Gulf of Oman.
      const p = x / this.levelLength;
      if (p > 0.7) {
        const k = Math.max(0, 1 - (p - 0.7) / 0.25);
        top = Math.round(top * k);
        bot = Math.round(bot * k);
      }
    }
    col = {
      top,
      bot,
      cliffTop: noise1d(x, this.seed + 3, 900) > 0.25,
      cliffBot: noise1d(x, this.seed + 9, 900) > 0.15 || lvl.n === 6,
    };
    this.cache.set(c, col);
    return col;
  }

  private columnAt(screenX: number): Column {
    return this.column(Math.floor((screenX + this.scrollX) / TILE));
  }

  /** Screen y of the northern shoreline at screen x. */
  topEdge(screenX: number): number {
    const r = this.columnAt(screenX).top;
    return r === 0 ? 0 : r * TILE - TILE / 2;
  }

  /** Screen y of the southern shoreline at screen x. */
  botEdge(screenX: number): number {
    const r = this.columnAt(screenX).bot;
    return r === 0 ? HEIGHT : HEIGHT - r * TILE + TILE / 2;
  }

  /** Water band [top, bottom] across a horizontal span, i.e. the tightest point. */
  waterBand(x0: number, x1: number): [number, number] {
    let top = 0;
    let bot = HEIGHT;
    for (let x = x0; x <= x1 + TILE; x += TILE) {
      const sx = Math.min(x, x1);
      top = Math.max(top, this.topEdge(sx));
      bot = Math.min(bot, this.botEdge(sx));
    }
    return [top, bot];
  }

  /** Where to put a shore emplacement at screen x, or null if the land is too thin. */
  emplacementSpot(screenX: number, side: 'top' | 'bot'): number | null {
    const col = this.columnAt(screenX);
    const rows = side === 'top' ? col.top : col.bot;
    if (rows < MIN_ROWS) return null;
    return side === 'top' ? rows * TILE - TILE / 2 - 22 : HEIGHT - rows * TILE + TILE / 2 + 22;
  }

  /** Centre y of the coast road at screen x, or null where the shore is cliff or too thin for one. */
  roadSpot(screenX: number, side: 'top' | 'bot'): number | null {
    const col = this.columnAt(screenX);
    if (side === 'top') return col.cliffTop || col.top < 3 ? null : (col.top - 2) * TILE + TILE / 2;
    return col.cliffBot || col.bot < 3 ? null : HEIGHT - (col.bot - 1) * TILE - TILE / 2;
  }

  update(dx: number, dtMs: number) {
    this.scrollX += dx;
    this.water.tilePositionX = this.scrollX / PX;
    this.waterTimer += dtMs;
    if (this.waterTimer > 450) {
      this.waterTimer = 0;
      this.waterFrame = (this.waterFrame + 1) % T.water.length;
      this.water.setFrame(T.water[this.waterFrame]);
    }
    this.land.x = -this.scrollX;
    this.refresh();
  }

  private refresh() {
    const c0 = Math.floor(this.scrollX / TILE) - 1;
    const c1 = Math.floor((this.scrollX + WIDTH) / TILE) + 1;
    for (const [c, bobs] of this.live) {
      if (c < c0 || c > c1) {
        for (const img of bobs) this.pool.push(img.setVisible(false));
        this.live.delete(c);
        this.cache.delete(c - 4);
      }
    }
    for (let c = c0; c <= c1; c++) if (!this.live.has(c)) this.live.set(c, this.paint(c));
  }

  /** Asphalt, with a parked lowrider now and then (about 1 in 7, alternating red and blue). */
  private roadTile(c: number): number {
    if (noise1d(c * 53, this.seed + 31, 1.3) <= 0.58) return T.road;
    return c % 2 === 0 ? T.roadCarRed : T.roadCarBlue;
  }

  private interiorTile(c: number, row: number, cliff: boolean, byRoad = false): number {
    const h = noise1d(c * 31 + row * 977, this.seed + 21, 1.7);
    if (cliff) return h > 0.75 ? T.rockDark : T.rock;
    if (h > 0.82) {
      const k = Math.floor((noise1d(c * 17 + row * 131, this.seed + 47, 1.1) + 1) * 2);
      return [T.village, T.tagA, T.tagB, T.billboard][Math.min(3, k)];
    }
    if (h > 0.6 && byRoad) return T.palm;
    if (h > 0.45) return T.scrub;
    if (h < -0.4) return T.dune;
    return T.sand;
  }

  private tile(x: number, y: number, frame: number): Phaser.GameObjects.Image {
    let img = this.pool.pop();
    if (!img) {
      img = this.land.scene.add.image(0, 0, 'tiles', 0).setOrigin(0).setScale(PX);
      this.land.add(img);
    }
    return img.setPosition(x, y).setFrame(frame).setVisible(true);
  }

  private paint(c: number): Phaser.GameObjects.Image[] {
    const col = this.column(c);
    const bobs: Phaser.GameObjects.Image[] = [];
    const x = c * TILE; // container-local: the container itself scrolls
    const rowsTotal = Math.ceil(HEIGHT / TILE);
    // Sandy coasts carry a road on the second row inland, with palms along its landward side.
    const roadTop = !col.cliffTop && col.top >= 3 ? col.top - 2 : -1;
    const roadBot = !col.cliffBot && col.bot >= 3 ? 1 : -1;
    for (let r = 0; r < col.top; r++) {
      let frame: number;
      if (r === col.top - 1) frame = col.cliffTop ? T.cliffN : T.shoreN;
      else if (r === roadTop) frame = this.roadTile(c);
      else frame = this.interiorTile(c, r, col.cliffTop, r === roadTop - 1);
      bobs.push(this.tile(x, r * TILE, frame));
    }
    for (let i = 0; i < col.bot; i++) {
      const r = rowsTotal - col.bot + i;
      const y = HEIGHT - (col.bot - i) * TILE;
      let frame: number;
      if (i === 0) frame = col.cliffBot ? T.cliffS : T.shoreS;
      else if (i === roadBot) frame = this.roadTile(c + 7);
      else frame = this.interiorTile(c, r + 40, col.cliffBot, i === roadBot + 1);
      bobs.push(this.tile(x, y, frame));
    }
    return bobs;
  }
}
