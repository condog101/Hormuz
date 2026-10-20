import Phaser from 'phaser';
import { HEIGHT, OX, PX, WIDTH } from '../data/balance';
import { api } from '../net/api';
import { Save } from '../systems/Save';
import { COLORS, menu, panel, text } from '../systems/UI';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('Leaderboard');
  }

  create() {
    this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'tiles', 0).setOrigin(0).setTileScale(PX).setAlpha(0.4);
    panel(this, OX + 160, 30, 640, 480);
    text(this, WIDTH / 2, 64, 'THE CHARTS', 24, COLORS.gold);
    const status = text(this, WIDTH / 2, 240, 'CALLING THE CHART PEOPLE...', 8, COLORS.dim);
    text(this, WIDTH / 2, 100, ' #  MC NAME           SCORE   TRACK', 8, COLORS.dim);
    api
      .leaderboard(15)
      .then((rows) => {
        status.destroy();
        if (rows.length === 0) text(this, WIDTH / 2, 240, 'NO ENTRIES YET. DROP SOMETHING.', 8);
        rows.forEach((r, i) => {
          const mine = Save.session && r.callsign.toLowerCase() === Save.session.callsign.toLowerCase();
          const lvl = r.levelReached > 10 ? `H${r.levelReached - 10}` : `T${r.levelReached}`;
          const line = `${String(i + 1).padStart(2)}  ${r.callsign.padEnd(16)} ${String(r.score).padStart(7)}   ${lvl.padStart(5)}`;
          text(this, WIDTH / 2, 128 + i * 22, line, 8, mine ? COLORS.gold : i < 3 ? COLORS.text : '#b9c6dc');
        });
      })
      .catch(() => status.setText('THE CHARTS ARE UNAVAILABLE (OFFLINE?)'));
    menu(this, WIDTH / 2, 478, [{ label: 'BACK', action: () => this.scene.start('Title') }]);
    this.cameras.main.fadeIn(250);
  }
}
