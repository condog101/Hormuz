import Phaser from 'phaser';
import { LEVEL_COUNT } from '../../../shared/progress';
import { HEIGHT, PX, WIDTH } from '../data/balance';
import { LEVELS } from '../data/levels';
import { api } from '../net/api';
import { Audio } from '../systems/Audio';
import { newRun } from '../systems/Run';
import { Save } from '../systems/Save';
import { COLORS, menu, panel, text } from '../systems/UI';

type View = 'main' | 'levels' | 'settings' | 'credits';

export class TitleScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private currentMenu: { destroy(): void } | null = null;
  private water!: Phaser.GameObjects.TileSprite;

  constructor() {
    super('Title');
  }

  create(data: { view?: View }) {
    this.water = this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'tiles', 0).setOrigin(0).setTileScale(PX);
    const ship = this.add.sprite(-80, 440, 'destroyer', 0).setScale(PX * 1.5);
    const turret = this.add.sprite(-80, 440, 'turret').setScale(PX * 1.5);
    this.tweens.add({
      targets: [ship, turret],
      x: WIDTH + 120,
      duration: 16000,
      repeat: -1,
      onUpdate: () => turret.setPosition(ship.x + 14 * PX * 1.5, ship.y),
    });
    text(this, WIDTH / 2, 56, 'STRAIGHT OUTTA', 16, COLORS.text);
    text(this, WIDTH / 2, 90, 'HORMUZ', 40, COLORS.gold);
    text(this, WIDTH / 2, 124, 'THE ALBUM. THE STRAIT. THE DON.', 8, COLORS.gold);
    text(this, WIDTH / 2, 140, 'TWENTY-ONE MILES OF BAD NEIGHBOURHOOD', 8, COLORS.dim);
    this.layer = this.add.container(0, 0);
    this.cameras.main.fadeIn(300);
    this.show(data?.view ?? 'main');
  }

  update(_t: number, dt: number) {
    this.water.tilePositionX += dt * 0.02;
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
      this.currentMenu = menu(this, WIDTH / 2, 180, [
        { label: cont > 1 ? `CONTINUE - TRACK ${cont}` : 'PRESS PLAY', action: () => this.start('campaign', cont) },
        { label: 'TRACKLIST', action: () => this.show('levels') },
        { label: p.endlessUnlocked ? 'HIDDEN TRACKS' : 'HIDDEN TRACKS (BEAT T10)', action: () => this.start('endless', 11), enabled: p.endlessUnlocked },
        { label: 'THE CHARTS', action: () => this.scene.start('Leaderboard') },
        { label: Save.session ? 'LEAVE THE LABEL' : 'SIGN TO THE LABEL', action: () => this.auth() },
        { label: 'MIXER', action: () => this.show('settings') },
        { label: 'LINER NOTES', action: () => this.show('credits') },
      ]);
      this.layer.add(
        text(this, WIDTH / 2, 410, 'WASD MOVE  MOUSE AIM  CLICK/SPACE FIRE\nSHIFT FLANK SPEED  E CIWS  ESC PAUSE', 8, COLORS.dim),
      );
    } else if (view === 'levels') {
      // Album back cover: number, title, running time, best score.
      this.layer.add(panel(this, WIDTH / 2 - 310, 140, 620, 300));
      this.layer.add(text(this, WIDTH / 2, 164, 'TRACKLIST', 16, COLORS.gold));
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
      this.currentMenu = menu(this, WIDTH / 2, 196, items, 22);
    } else if (view === 'settings') {
      const s = p.settings;
      const vol = Math.round(s.sfx * 10);
      this.currentMenu = menu(this, WIDTH / 2, 200, [
        { label: `SFX VOLUME  < ${'#'.repeat(vol).padEnd(10, '.')} >`, action: () => this.setVolume((vol + 2) % 12) },
        { label: `SCREEN SHAKE  ${s.shake ? 'ON' : 'OFF'}`, action: () => this.toggleShake() },
        { label: 'BACK', action: () => this.show('main') },
      ]);
      this.layer.add(text(this, WIDTH / 2, 320, 'ENTER/CLICK TO CHANGE', 8, COLORS.dim));
    } else {
      this.layer.add(panel(this, WIDTH / 2 - 300, 150, 600, 250));
      this.layer.add(
        text(
          this,
          WIDTH / 2,
          260,
          'STRAIGHT OUTTA HORMUZ\n\nA GAME BY CONNOR\nCODE: CLAUDE   ART: GENERATED + LIBRESPRITE\nFONT: PRESS START 2P (OFL)   SFX + BEATS: ZZFX\n\nBIG DON IS A PARODY OF DONALD TRUMP.\nEVERY LINE IS FICTIONAL SATIRE, NOT A REAL QUOTE.\nNO REAL LYRICS WERE HARMED.',
          8,
          COLORS.text,
        ),
      );
      this.currentMenu = menu(this, WIDTH / 2, 370, [{ label: 'BACK', action: () => this.show('main') }]);
    }
  }

  private setVolume(step: number) {
    const v = Math.min(10, step) / 10;
    Save.update((p) => (p.settings.sfx = v));
    Audio.setVolume(v);
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
