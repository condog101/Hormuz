import Phaser from 'phaser';
import { LEVEL_COUNT } from '../../../shared/progress';
import { HEIGHT, PX, WIDTH } from '../data/balance';
import { syncProgress } from '../net/sync';
import { Audio } from '../systems/Audio';
import { Save } from '../systems/Save';
import { COLORS, onContinue, panel, text } from '../systems/UI';
import type { LevelResult } from './Game';

export class LevelClearScene extends Phaser.Scene {
  constructor() {
    super('LevelClear');
  }

  create(r: LevelResult) {
    const run = r.run;
    const lvl = run.level;
    const finishedCampaign = run.mode === 'campaign' && lvl >= LEVEL_COUNT;

    Save.update((p) => {
      if (lvl <= LEVEL_COUNT) {
        p.levelBest[String(lvl)] = Math.max(p.levelBest[String(lvl)] ?? 0, r.levelScore);
        p.highestLevel = Math.max(p.highestLevel, Math.min(LEVEL_COUNT, lvl + 1));
      }
      if (finishedCampaign) p.endlessUnlocked = true;
      if (run.mode === 'endless') p.endlessBest = Math.max(p.endlessBest, run.score);
    });
    void syncProgress();

    this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'tiles', 0).setOrigin(0).setTileScale(PX).setAlpha(0.5);
    panel(this, 200, 100, 560, 320);
    text(this, WIDTH / 2, 140, lvl > LEVEL_COUNT ? 'WAVE SURVIVED' : 'TRANSIT COMPLETE', 24, COLORS.gold);
    const lines = [
      `LEVEL SCORE      ${String(r.levelScore - r.bonus).padStart(7)}`,
      `CLEAR BONUS      ${String(1000 * lvl).padStart(7)}`,
      `HULL BONUS       ${String(r.hp * 10).padStart(7)}`,
      `NO-DAMAGE BONUS  ${String(r.tookDamage ? 0 : 2000).padStart(7)}`,
      '',
      `RUN TOTAL        ${String(run.score).padStart(7)}`,
    ];
    lines.forEach((l, i) =>
      this.time.delayedCall(250 * (i + 1), () => {
        text(this, WIDTH / 2, 200 + i * 24, l, 8, i === 5 ? COLORS.gold : COLORS.text);
        if (l) Audio.play('blip');
      }),
    );
    const prompt = text(this, WIDTH / 2, 385, finishedCampaign ? 'PRESS ANY KEY' : 'PRESS ANY KEY FOR NEXT LEVEL', 8, COLORS.gold);
    this.tweens.add({ targets: prompt, alpha: 0.2, yoyo: true, repeat: -1, duration: 500 });
    this.cameras.main.fadeIn(250);
    onContinue(
      this,
      () => {
        if (finishedCampaign) {
          this.scene.start('GameOver', { run, victory: true });
        } else {
          run.level++;
          this.scene.start('LevelIntro', { run });
        }
      },
      1800,
    );
  }
}
