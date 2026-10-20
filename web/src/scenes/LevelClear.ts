import Phaser from 'phaser';
import { LEVEL_COUNT } from '../../../shared/progress';
import { HEIGHT, PX, WIDTH } from '../data/balance';
import { ENDING } from '../data/story';
import { syncProgress } from '../net/sync';
import { Audio } from '../systems/Audio';
import { byInput } from '../systems/Device';
import { Save } from '../systems/Save';
import { COLORS, onContinue, panel, text } from '../systems/UI';
import type { LevelResult } from './Game';

/** Album-style certification for a cleared track. Purely cosmetic. */
export function certification(level: number, levelScore: number): 'GOLD' | 'PLATINUM' | 'DIAMOND' {
  const base = 1000 * level;
  if (levelScore >= base + 9000) return 'DIAMOND';
  if (levelScore >= base + 5000) return 'PLATINUM';
  return 'GOLD';
}

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
    text(this, WIDTH / 2, 140, lvl > LEVEL_COUNT ? 'HIDDEN TRACK DONE' : 'TRACK COMPLETE', 24, COLORS.gold);
    if (r.feat) text(this, WIDTH / 2, 172, `FEAT. ${r.feat}`, 8, COLORS.gold);
    const lines = [
      `TRACK SCORE      ${String(r.levelScore - r.bonus).padStart(7)}`,
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
    // Cosmetic certification stamp: thresholds on the track score, scaled by track number. No scoring change.
    const stamp = certification(lvl, r.levelScore);
    this.time.delayedCall(250 * (lines.length + 1), () => {
      const t = text(this, WIDTH / 2, 352, `* CERTIFIED ${stamp} *`, 12, COLORS.gold).setScale(2).setAlpha(0);
      this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });
      Audio.play('select');
    });
    const prompt = text(this, WIDTH / 2, 390, finishedCampaign ? byInput('PRESS ANY KEY', 'TAP TO CONTINUE') : byInput('PRESS ANY KEY FOR THE NEXT TRACK', 'TAP FOR THE NEXT TRACK'), 8, COLORS.gold);
    this.tweens.add({ targets: prompt, alpha: 0.2, yoyo: true, repeat: -1, duration: 500 });
    this.cameras.main.fadeIn(250);
    onContinue(
      this,
      () => {
        if (finishedCampaign) {
          this.scene.start('Briefing', { cards: ENDING, next: 'GameOver', nextData: { run, victory: true } });
        } else {
          run.level++;
          this.scene.start('LevelIntro', { run });
        }
      },
      1800,
    );
  }
}
