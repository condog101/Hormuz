import Phaser from 'phaser';
import { CIWS, DEPTH, PLAYER } from '../data/balance';
import type { LevelDef } from '../data/levels';
import { COLORS, panel, text } from './UI';

export class HUD {
  private root: Phaser.GameObjects.Container;
  private hull: Phaser.GameObjects.Rectangle;
  private lives: Phaser.GameObjects.Image[] = [];
  private score: Phaser.GameObjects.Text;
  private progress: Phaser.GameObjects.Rectangle;
  private ciws: Phaser.GameObjects.Rectangle;
  private ciwsIcon: Phaser.GameObjects.Image;
  private bossBar: Phaser.GameObjects.Container;
  private bossFill: Phaser.GameObjects.Rectangle;
  private buffBar: Phaser.GameObjects.Container;
  private buffLabel: Phaser.GameObjects.Text;
  private buffFill: Phaser.GameObjects.Rectangle;
  private shownScore = 0;

  constructor(scene: Phaser.Scene, level: LevelDef) {
    const s = scene;
    this.root = s.add.container(0, 0).setDepth(DEPTH.hud);
    const W = 300;
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
    // CIWS
    this.ciwsIcon = s.add.image(258, 42, 'hud_icons', 3);
    this.root.add(this.ciwsIcon);
    this.root.add(s.add.rectangle(270, 42, 28, 6, 0x000000).setOrigin(0, 0.5).setStrokeStyle(1, 0x5a6d8c));
    this.ciws = s.add.rectangle(271, 42, 26, 4, 0x4ad8ff).setOrigin(0, 0.5);
    this.root.add(this.ciws);
    // score + progress
    this.score = text(s, 20, 62, '0', 8, COLORS.text, 0).setOrigin(0, 0.5);
    this.root.add(this.score);
    this.root.add(s.add.rectangle(130, 62, 166, 4, 0x1d2b46).setOrigin(0, 0.5));
    this.progress = s.add.rectangle(130, 62, 0, 4, 0xffd84a).setOrigin(0, 0.5);
    this.root.add(this.progress);
    // guest-feature buff (hidden unless one is running)
    this.buffBar = s.add.container(8, 86).setVisible(false).setDepth(DEPTH.hud);
    this.buffBar.add(panel(s, 0, 0, 300, 24));
    this.buffLabel = text(s, 12, 12, '', 8, COLORS.gold, 0).setOrigin(0, 0.5);
    this.buffBar.add(this.buffLabel);
    this.buffBar.add(s.add.rectangle(130, 12, 160, 8, 0x000000).setOrigin(0, 0.5).setStrokeStyle(1, 0xb88c1e));
    this.buffFill = s.add.rectangle(131, 12, 158, 6, 0xffd84a).setOrigin(0, 0.5);
    this.buffBar.add(this.buffFill);
    // boss bar (hidden until the boss arrives)
    this.bossBar = s.add.container(480, 524).setVisible(false).setDepth(DEPTH.hud);
    this.bossBar.add(text(s, 0, -14, "THE AYATOLLAH'S MOTHERSHIP", 8, COLORS.red));
    this.bossBar.add(s.add.rectangle(0, 0, 404, 12, 0x000000).setStrokeStyle(1, 0xff4a4a));
    this.bossFill = s.add.rectangle(-200, 0, 400, 8, 0xff4a4a).setOrigin(0, 0.5);
    this.bossBar.add(this.bossFill);
  }

  update(state: { hp: number; lives: number; score: number; progress: number; ciwsReady: number; boss?: { hp: number; max: number } }) {
    const hpf = Phaser.Math.Clamp(state.hp / PLAYER.hp, 0, 1);
    this.hull.width = 118 * hpf;
    this.hull.fillColor = hpf > 0.6 ? 0x6dff8f : hpf > 0.3 ? 0xffd84a : 0xff4a4a;
    this.lives.forEach((img, i) => img.setAlpha(i < state.lives ? 1 : 0.2));
    this.shownScore += (state.score - this.shownScore) * 0.2;
    if (Math.abs(state.score - this.shownScore) < 1) this.shownScore = state.score;
    this.score.setText(String(Math.round(this.shownScore)).padStart(7, '0'));
    this.progress.width = 166 * Phaser.Math.Clamp(state.progress, 0, 1);
    this.ciws.width = 26 * Phaser.Math.Clamp(state.ciwsReady, 0, 1);
    this.ciwsIcon.setAlpha(state.ciwsReady >= 1 ? 1 : 0.4);
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

  static ciwsFraction(now: number, readyAt: number) {
    return 1 - Math.max(0, readyAt - now) / CIWS.cooldownMs;
  }
}
