import Phaser from 'phaser';
import { Audio } from '../systems/Audio';
import { Save } from '../systems/Save';
import { syncProgress } from '../net/sync';
import { COLORS, text } from '../systems/UI';

/** [key, frameWidth, frameHeight] for every generated sheet in public/assets/sprites. */
const SHEETS: [string, number, number][] = [
  ['destroyer', 64, 24],
  ['turret', 12, 12],
  ['boat_a', 16, 8],
  ['boat_b', 16, 8],
  ['artillery', 24, 24],
  ['battery', 24, 24],
  ['shell', 4, 4],
  ['shell_shadow', 6, 6],
  ['reticle', 16, 16],
  ['round', 6, 3],
  ['splash', 16, 16],
  ['explosion_sm', 16, 16],
  ['explosion_lg', 32, 32],
  ['smoke', 8, 8],
  ['mine', 12, 12],
  ['drone', 20, 12],
  ['missile', 16, 6],
  ['boss', 48, 20],
  ['pickup', 12, 12],
  ['potus', 64, 64],
  ['ui_panel', 48, 48],
  ['hud_icons', 16, 16],
  ['tiles', 16, 16],
  ['title_logo', 232, 104],
  ['advisory', 48, 32],
  ['lowrider', 24, 12],
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const bar = this.add.rectangle(480, 290, 0, 8, 0xffd84a).setOrigin(0, 0.5);
    this.add.rectangle(480, 290, 304, 12).setStrokeStyle(2, 0xb88c1e);
    bar.x = 480 - 150;
    text(this, 480, 250, 'LOADING', 16, COLORS.text);
    this.load.on('progress', (v: number) => (bar.width = 300 * v));
    for (const [key, w, h] of SHEETS) {
      this.load.spritesheet(key, `assets/sprites/${key}.png`, { frameWidth: w, frameHeight: h });
    }
  }

  create() {
    const g = this.make.graphics({}, false);
    g.fillStyle(0xffffff).fillRect(0, 0, 2, 2);
    g.generateTexture('px', 2, 2);
    g.destroy();
    // Golden-hour haze: a 1x64 vertical gradient, stretched over the screen on later tracks.
    const haze = this.textures.createCanvas('haze', 1, 64);
    if (haze) {
      const grad = haze.context.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, '#ff7a3d');
      grad.addColorStop(1, '#7a3cc8');
      haze.context.fillStyle = grad;
      haze.context.fillRect(0, 0, 1, 64);
      haze.refresh();
    }

    const a = this.anims;
    const strip = (key: string, start: number, end: number, frameRate: number, repeat = -1, anim = key) =>
      a.create({ key: anim, frames: a.generateFrameNumbers(key, { start, end }), frameRate, repeat });
    strip('boat_a', 0, 1, 8);
    strip('boat_b', 0, 1, 8);
    strip('reticle', 0, 1, 6);
    strip('splash', 0, 3, 12, 0);
    strip('explosion_sm', 0, 5, 16, 0);
    strip('explosion_lg', 0, 5, 12, 0);
    strip('smoke', 0, 3, 6, 0);
    strip('mine', 0, 1, 2);
    strip('drone', 0, 1, 12);
    strip('missile', 0, 1, 16);
    strip('pickup', 0, 1, 3);
    strip('destroyer', 3, 8, 4, 0, 'destroyer_sink');
    // hydraulics: level, front up, level, rear up
    a.create({ key: 'lowrider_red', frames: a.generateFrameNumbers('lowrider', { frames: [0, 1, 0, 2] }), frameRate: 6, repeat: -1 });
    a.create({ key: 'lowrider_blue', frames: a.generateFrameNumbers('lowrider', { frames: [5, 6, 5, 7] }), frameRate: 6, repeat: -1 });

    Save.load();
    Audio.warm();
    void syncProgress();
    this.scene.start('Title');
  }
}
