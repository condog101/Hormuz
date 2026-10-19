import Phaser from 'phaser';
import { HEIGHT, PX, WIDTH } from '../data/balance';
import { getLevel } from '../data/levels';
import { byInput } from '../systems/Device';
import type { RunState } from '../systems/Run';
import { COLORS, onContinue, panel, text } from '../systems/UI';

export class LevelIntroScene extends Phaser.Scene {
  constructor() {
    super('LevelIntro');
  }

  create(data: { run: RunState }) {
    const run = data.run;
    const L = getLevel(run.level);
    this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'tiles', 0).setOrigin(0).setTileScale(PX).setAlpha(0.5);
    panel(this, 120, 90, 720, 360);
    text(this, WIDTH / 2, 130, run.level > 10 ? 'HIDDEN TRACK' : `TRACK ${L.n} OF 10`, 8, COLORS.dim);
    text(this, WIDTH / 2, 164, L.name, 24, COLORS.gold);
    text(this, WIDTH / 2, 220, L.brief, 8, COLORS.text).setWordWrapWidth(620);

    const threats: [string, number][] = [
      ['artillery', 0],
      ['boat_a', 0],
    ];
    if (L.boats.zigChance > 0) threats.push(['boat_b', 0]);
    if (L.minesMs) threats.push(['mine', 0]);
    if (L.dronesMs) threats.push(['drone', 0]);
    if (L.batterySpacing) threats.push(['battery', 0]);
    if (L.driveByMs) threats.push(['lowrider', 0]);
    if (L.boss) threats.push(['boss', 0]);
    text(this, WIDTH / 2, 268, 'FEATURING', 8, COLORS.red);
    const spacing = 80;
    const x0 = WIDTH / 2 - ((threats.length - 1) * spacing) / 2;
    threats.forEach(([key, f], i) => this.add.image(x0 + i * spacing, 310, key, f).setScale(PX));

    text(this, WIDTH / 2, 370, `SCORE ${run.score}   LIVES ${run.lives}`, 8, COLORS.text);
    const go = text(this, WIDTH / 2, 410, byInput('PRESS ANY KEY TO DROP', 'TAP TO DROP'), 16, COLORS.gold);
    this.tweens.add({ targets: go, alpha: 0.2, yoyo: true, repeat: -1, duration: 500 });
    this.cameras.main.fadeIn(250);
    onContinue(this, () => this.scene.start('Game', { run }), 250);
  }
}
