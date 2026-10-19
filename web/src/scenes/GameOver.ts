import Phaser from 'phaser';
import { HEIGHT, PX, WIDTH } from '../data/balance';
import { pickQuote } from '../data/quotes';
import { submitRun, syncProgress } from '../net/sync';
import { Audio } from '../systems/Audio';
import { newRun, type RunState } from '../systems/Run';
import { Save } from '../systems/Save';
import { COLORS, menu, panel, text } from '../systems/UI';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: { run: RunState; victory: boolean }) {
    const { run, victory } = data;
    Save.update((p) => {
      if (run.mode === 'endless') p.endlessBest = Math.max(p.endlessBest, run.score);
      else p.bestRun = Math.max(p.bestRun, run.score);
    });
    void syncProgress();

    this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'tiles', 0).setOrigin(0).setTileScale(PX).setAlpha(0.4);
    panel(this, 160, 60, 640, 420);
    text(this, WIDTH / 2, 100, victory ? 'OPEN WATER!' : 'SHIP LOST', 32, victory ? COLORS.gold : COLORS.red);
    if (victory) {
      text(this, WIDTH / 2, 140, 'YOU RAN THE STRAIT. ENDLESS MODE UNLOCKED.', 8, COLORS.green);
      Audio.play('clear');
    } else {
      Audio.play('death');
    }
    const mins = Math.floor(run.playMs / 60000);
    const secs = Math.floor((run.playMs % 60000) / 1000);
    text(
      this,
      WIDTH / 2,
      200,
      `FINAL SCORE  ${run.score}\n\nLEVEL ${run.level}   KILLS ${run.kills}   TIME ${mins}:${String(secs).padStart(2, '0')}`,
      8,
    );

    const portrait = this.add.sprite(196, 244, 'potus', 0).setOrigin(0).setScale(1.5).setCrop(0, 0, 64, 56);
    const line = pickQuote(victory ? 'victory' : 'death', []).text;
    text(this, 312, 252, `"${line}"`, 8, COLORS.text, 0).setOrigin(0, 0).setAlign('left').setWordWrapWidth(450);
    this.time.addEvent({ delay: 110, repeat: 30, callback: () => portrait.setFrame(Phaser.Math.Between(0, 2)) });
    this.time.delayedCall(3600, () => portrait.setFrame(0));

    const status = text(this, WIDTH / 2, 380, Save.session ? 'TRANSMITTING SCORE...' : 'SIGN IN TO POST SCORES TO THE LEADERBOARD', 8, COLORS.dim);
    if (Save.session) {
      void submitRun({
        score: run.score,
        startLevel: run.startLevel,
        levelReached: run.level,
        durationMs: Math.round(run.playMs),
        kills: run.kills,
      }).then((res) => status.setText(res ? `LEADERBOARD RANK #${res.rank}` : 'SCORE NOT POSTED (OFFLINE?)'));
    }

    menu(this, WIDTH / 2, 420, [
      { label: 'TRY AGAIN', action: () => this.scene.start('LevelIntro', { run: newRun(run.mode, run.startLevel) }) },
      { label: 'MAIN MENU', action: () => this.scene.start('Title') },
    ], 26);
    this.cameras.main.fadeIn(300);
  }
}
