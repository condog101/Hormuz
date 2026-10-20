import Phaser from 'phaser';
import { DEPTH, DISS, PLAYER, WEAPONS, type WeaponKey } from '../data/balance';
import type { LevelDef } from '../data/levels';
import { COLORS, panel, text } from './UI';

export class HUD {
  private root: Phaser.GameObjects.Container;
  private hull: Phaser.GameObjects.Rectangle;
  private lives: Phaser.GameObjects.Image[] = [];
  private score: Phaser.GameObjects.Text;
  private progress: Phaser.GameObjects.Rectangle;
  private diss: Phaser.GameObjects.Rectangle;
  private dissIcon: Phaser.GameObjects.Image;
  private bossBar: Phaser.GameObjects.Container;
  private bossFill: Phaser.GameObjects.Rectangle;
  private weaponIcon: Phaser.GameObjects.Image;
  private weaponName: Phaser.GameObjects.Text;
  private reload: Phaser.GameObjects.Rectangle;
  private buffBar: Phaser.GameObjects.Container;
  private buffLabel: Phaser.GameObjects.Text;
  private buffFill: Phaser.GameObjects.Rectangle;
  private shownScore = 0;

  constructor(private scene: Phaser.Scene, level: LevelDef) {
    const s = scene;
    this.root = s.add.container(0, 0).setDepth(DEPTH.hud);
    const W = 306;
    this.root.add(panel(s, 8, 8, W, 72));
    this.root.add(text(s, 20, 22, `${level.n > 10 ? `H${level.n - 10}` : `T${level.n}`} ${level.name}`, 8, COLORS.gold, 0).setOrigin(0, 0.5));
    // hull
    this.root.add(s.add.image(28, 42, 'hud_icons', 0));
    this.root.add(s.add.rectangle(42, 42, 120, 10, 0x000000).setOrigin(0, 0.5).setStrokeStyle(1, 0x5a6d8c));
    this.hull = s.add.rectangle(43, 42, 118, 8, 0x6dff8f).setOrigin(0, 0.5);
    this.root.add(this.hull);
    // lives
    for (let i = 0; i < PLAYER.lives; i++) {
      const img = s.add.image(184 + i * 18, 42, 'hud_icons', 1);
      this.lives.push(img);
      this.root.add(img);
    }
    // DISS TRACKS
    this.dissIcon = s.add.image(258, 42, 'hud_icons', 9);
    this.root.add(this.dissIcon);
    this.root.add(s.add.rectangle(270, 42, 28, 6, 0x000000).setOrigin(0, 0.5).setStrokeStyle(1, 0x5a6d8c));
    this.diss = s.add.rectangle(271, 42, 26, 4, 0xffd84a).setOrigin(0, 0.5);
    this.root.add(this.diss);
    // score + progress
    this.score = text(s, 20, 62, '0', 8, COLORS.text, 0).setOrigin(0, 0.5);
    this.root.add(this.score);
    this.root.add(s.add.rectangle(88, 62, 120, 4, 0x1d2b46).setOrigin(0, 0.5));
    this.progress = s.add.rectangle(88, 62, 0, 4, 0xffd84a).setOrigin(0, 0.5);
    this.root.add(this.progress);
    // main gun: icon, name and a thin reload bar under the name
    this.weaponIcon = s.add.image(220, 62, 'hud_icons', WEAPONS.nine.icon);
    this.root.add(this.weaponIcon);
    this.weaponName = text(s, 232, 61, WEAPONS.nine.name, 8, COLORS.text, 0).setOrigin(0, 0.5);
    this.root.add(this.weaponName);
    this.root.add(s.add.rectangle(232, 70, 64, 2, 0x1d2b46).setOrigin(0, 0.5));
    this.reload = s.add.rectangle(232, 70, 64, 2, 0x4ad8ff).setOrigin(0, 0.5);
    this.root.add(this.reload);
    // guest-feature buff (hidden unless one is running)
    this.buffBar = s.add.container(8, 86).setVisible(false).setDepth(DEPTH.hud);
    this.buffBar.add(panel(s, 0, 0, 300, 24));
    this.buffLabel = text(s, 12, 12, '', 8, COLORS.gold, 0).setOrigin(0, 0.5);
    this.buffBar.add(this.buffLabel);
    this.buffBar.add(s.add.rectangle(130, 12, 160, 8, 0x000000).setOrigin(0, 0.5).setStrokeStyle(1, 0xb88c1e));
    this.buffFill = s.add.rectangle(131, 12, 158, 6, 0xffd84a).setOrigin(0, 0.5);
    this.buffBar.add(this.buffFill);
    // boss bar (hidden until the boss arrives)
    this.bossBar = s.add.container(480, 492).setVisible(false).setDepth(DEPTH.hud);
    this.bossBar.add(text(s, 0, -14, level.bossName ?? "THE AYATOLLAH'S MOTHERSHIP", 8, COLORS.red));
    this.bossBar.add(s.add.rectangle(0, 0, 404, 12, 0x000000).setStrokeStyle(1, 0xff4a4a));
    this.bossFill = s.add.rectangle(-200, 0, 400, 8, 0xff4a4a).setOrigin(0, 0.5);
    this.bossBar.add(this.bossFill);
  }

  setWeapon(key: WeaponKey) {
    this.weaponIcon.setFrame(WEAPONS[key].icon);
    this.weaponName.setText(WEAPONS[key].name);
  }

  update(state: {
    hp: number;
    lives: number;
    score: number;
    progress: number;
    dissReady: number;
    reload: number;
    boss?: { hp: number; max: number };
  }) {
    const hpf = Phaser.Math.Clamp(state.hp / PLAYER.hp, 0, 1);
    this.hull.width = 118 * hpf;
    this.hull.fillColor = hpf > 0.6 ? 0x6dff8f : hpf > 0.3 ? 0xffd84a : 0xff4a4a;
    this.lives.forEach((img, i) => img.setAlpha(i < state.lives ? 1 : 0.2));
    this.shownScore += (state.score - this.shownScore) * 0.2;
    if (Math.abs(state.score - this.shownScore) < 1) this.shownScore = state.score;
    this.score.setText(String(Math.round(this.shownScore)).padStart(7, '0'));
    this.progress.width = 120 * Phaser.Math.Clamp(state.progress, 0, 1);
    this.reload.width = 64 * Phaser.Math.Clamp(state.reload, 0, 1);
    this.diss.width = 26 * Phaser.Math.Clamp(state.dissReady, 0, 1);
    // dim while charging, blinking once it's ready to fire
    const blink = Math.floor(this.scene.time.now / 250) % 2 === 0;
    this.dissIcon.setAlpha(state.dissReady < 1 ? 0.4 : blink ? 1 : 0.3);
    if (state.boss) {
      this.bossBar.setVisible(true);
      this.bossFill.width = 400 * Phaser.Math.Clamp(state.boss.hp / state.boss.max, 0, 1);
    } else this.bossBar.setVisible(false);
  }

  /** Show the running guest buff, or hide the bar when `fraction` <= 0. */
  setBuff(label: string, fraction: number) {
    if (fraction <= 0) {
      this.buffBar.setVisible(false);
      return;
    }
    this.buffBar.setVisible(true);
    this.buffLabel.setText(label);
    this.buffFill.width = 158 * Phaser.Math.Clamp(fraction, 0, 1);
  }

  static dissFraction(now: number, readyAt: number) {
    return 1 - Math.max(0, readyAt - now) / DISS.rechargeMs;
  }
}
