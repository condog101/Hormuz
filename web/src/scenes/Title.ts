import Phaser from 'phaser';
import { LEVEL_COUNT } from '../../../shared/progress';
import { HEIGHT, PX, WIDTH } from '../data/balance';
import { LEVELS } from '../data/levels';
import { api } from '../net/api';
import { Audio } from '../systems/Audio';
import { Music } from '../systems/Music';
import { newRun } from '../systems/Run';
import { Save } from '../systems/Save';
import { COLORS, menu, panel, text } from '../systems/UI';

type View = 'main' | 'levels' | 'settings' | 'credits';

const WATER_Y = 238;
const WATER_H = 176;
const SHIP_Y = WATER_Y + WATER_H / 2 + 20;
const MENU_X = 690;

export class TitleScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private currentMenu: { destroy(): void } | null = null;
  private water!: Phaser.GameObjects.TileSprite;
  private ship!: Phaser.GameObjects.Sprite;
  private turret!: Phaser.GameObjects.Sprite;

  constructor() {
    super('Title');
  }

  create(data: { view?: View }) {
    // Album cover: black, a strip of water across the middle, logo top-left, menu on the right.
    this.cameras.main.setBackgroundColor('#000000');
    this.water = this.add.tileSprite(0, WATER_Y, WIDTH, WATER_H, 'tiles', 0).setOrigin(0).setTileScale(PX);
    this.add.rectangle(0, WATER_Y, WIDTH, 2, 0xb88c1e).setOrigin(0);
    this.add.rectangle(0, WATER_Y + WATER_H - 2, WIDTH, 2, 0xb88c1e).setOrigin(0);
    this.ship = this.add.sprite(-80, SHIP_Y, 'destroyer', 0).setScale(PX * 1.5);
    this.turret = this.add.sprite(-80, SHIP_Y, 'turret').setScale(PX * 1.5);
    this.tweens.add({ targets: this.ship, x: WIDTH + 120, duration: 16000, repeat: -1 });
    this.add.image(20, 14, 'title_logo').setOrigin(0).setScale(1.25);
    this.add.image(WIDTH - 24, HEIGHT - 24, 'advisory').setOrigin(1).setScale(2);
    const don = this.add.sprite(24, HEIGHT - 110, 'potus', 4).setOrigin(0).setScale(1.5);
    don.setCrop(0, 0, 64, 56);
    text(this, 132, HEIGHT - 60, 'FEAT. BIG DON', 8, COLORS.gold, 0).setOrigin(0, 0.5);
    this.layer = this.add.container(0, 0);
    this.cameras.main.fadeIn(300);
    // Silent until the browser lets audio run (first gesture); the scheduler picks it up then.
    Music.play('title');
    this.show(data?.view ?? 'main');
  }

  update(t: number, dt: number) {
    this.water.tilePositionX += dt * 0.02;
    // hydraulics bob, same as the in-game flank bounce
    this.ship.y = SHIP_Y + Math.sin(t / 60) * 3;
    this.turret.setPosition(this.ship.x + 14 * PX * 1.5, this.ship.y);
  }

  private clear() {
    this.currentMenu?.destroy();
    this.currentMenu = null;
    this.layer.removeAll(true);
  }

  private show(view: View) {
    this.clear();
    const p = Save.progress;
    const who = Save.session ? `MC: ${Save.session.callsign}` : 'NOT SIGNED TO THE LABEL (PROGRESS SAVED ON THIS DEVICE)';
    this.layer.add(text(this, WIDTH / 2, HEIGHT - 16, who, 8, COLORS.dim));
    if (view === 'main') {
      const cont = p.highestLevel;
      this.layer.add(text(this, 165, 160, 'THE ALBUM. THE STRAIT. THE DON.', 8, COLORS.gold));
      this.layer.add(text(this, 165, 176, 'TWENTY-ONE MILES OF BAD NEIGHBOURHOOD', 8, COLORS.dim));
      this.currentMenu = menu(this, MENU_X, 48, [
        { label: cont > 1 ? `CONTINUE - TRACK ${cont}` : 'PRESS PLAY', action: () => this.start('campaign', cont) },
        { label: 'TRACKLIST', action: () => this.show('levels') },
        { label: p.endlessUnlocked ? 'HIDDEN TRACKS' : 'HIDDEN TRACKS (BEAT T10)', action: () => this.start('endless', 11), enabled: p.endlessUnlocked },
        { label: 'THE CHARTS', action: () => this.scene.start('Leaderboard') },
        { label: Save.session ? 'LEAVE THE LABEL' : 'SIGN TO THE LABEL', action: () => this.auth() },
        { label: 'MIXER', action: () => this.show('settings') },
        { label: 'LINER NOTES', action: () => this.show('credits') },
      ]);
      this.layer.add(
        text(this, 600, 450, 'WASD MOVE  MOUSE AIM  CLICK/SPACE FIRE\nSHIFT FLANK SPEED  E CIWS  ESC PAUSE', 8, COLORS.dim),
      );
    } else if (view === 'levels') {
      // Album back cover: number, title, running time, best score.
      this.layer.add(panel(this, WIDTH / 2 - 310, 150, 620, 320));
      this.layer.add(text(this, WIDTH / 2, 176, 'TRACKLIST', 16, COLORS.gold));
      const items = LEVELS.map((l) => {
        const best = p.levelBest[String(l.n)];
        const unlocked = l.n <= p.highestLevel;
        const mmss = `${Math.floor(l.durationS / 60)}:${String(l.durationS % 60).padStart(2, '0')}`;
        return {
          label: `${String(l.n).padStart(2, '0')} ${l.name.padEnd(16, ' ')} ${mmss}  ${unlocked ? (best ? String(best).padStart(6, ' ') : '     -') : 'LOCKED'}`,
          action: () => this.start('campaign', l.n),
          enabled: unlocked,
        };
      });
      items.push({ label: 'BACK', action: () => this.show('main'), enabled: true });
      this.currentMenu = menu(this, WIDTH / 2, 208, items, 22);
    } else if (view === 'settings') {
      const s = p.settings;
      const vol = Math.round(s.sfx * 10);
      const mus = Math.round(s.music * 10);
      const bar = (n: number) => `< ${'#'.repeat(n).padEnd(10, '.')} >`;
      this.layer.add(panel(this, WIDTH / 2 - 320, 170, 640, 220));
      this.layer.add(text(this, WIDTH / 2, 196, 'MIXER', 16, COLORS.gold));
      this.currentMenu = menu(this, WIDTH / 2, 240, [
        { label: `SFX VOLUME    ${bar(vol)}`, action: () => this.setVolume((vol + 2) % 12) },
        { label: `MUSIC VOLUME  ${bar(mus)}`, action: () => this.setMusicVolume((mus + 2) % 12) },
        { label: `SCREEN SHAKE  ${s.shake ? 'ON' : 'OFF'}`, action: () => this.toggleShake() },
        { label: 'BACK', action: () => this.show('main') },
      ]);
      this.layer.add(text(this, WIDTH / 2, 366, 'ENTER/CLICK TO CHANGE', 8, COLORS.dim));
    } else {
      this.layer.add(panel(this, WIDTH / 2 - 300, 160, 600, 260));
      this.layer.add(
        text(
          this,
          WIDTH / 2,
          270,
          'STRAIGHT OUTTA HORMUZ\n\nA GAME BY CONNOR\nCODE: CLAUDE   ART: GENERATED + LIBRESPRITE\nFONT: PRESS START 2P (OFL)   SFX + BEATS: ZZFX\n\nBIG DON IS A PARODY OF DONALD TRUMP.\nEVERY LINE IS FICTIONAL SATIRE, NOT A REAL QUOTE.\nNO REAL LYRICS WERE HARMED.',
          8,
          COLORS.text,
        ),
      );
      this.currentMenu = menu(this, WIDTH / 2, 390, [{ label: 'BACK', action: () => this.show('main') }]);
    }
  }

  private setVolume(step: number) {
    const v = Math.min(10, step) / 10;
    Save.update((p) => (p.settings.sfx = v));
    Audio.setVolume(v);
    Audio.play('select');
    this.show('settings');
  }

  private setMusicVolume(step: number) {
    const v = Math.min(10, step) / 10;
    Save.update((p) => (p.settings.music = v));
    Music.setVolume(v);
    Audio.play('select');
    this.show('settings');
  }

  private toggleShake() {
    Save.update((p) => (p.settings.shake = !p.settings.shake));
    this.show('settings');
  }

  private auth() {
    if (Save.session) {
      void api.logout().catch(() => undefined);
      Save.setSession(null);
      this.show('main');
    } else {
      this.scene.start('Login');
    }
  }

  private start(mode: 'campaign' | 'endless', level: number) {
    Audio.unlock();
    const lvl = Math.min(level, LEVEL_COUNT);
    this.cameras.main.fadeOut(250);
    this.time.delayedCall(260, () => this.scene.start('LevelIntro', { run: newRun(mode, lvl) }));
  }
}
