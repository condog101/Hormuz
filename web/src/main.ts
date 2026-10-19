import Phaser from 'phaser';
import { HEIGHT, WIDTH } from './data/balance';
import { BootScene } from './scenes/Boot';
import { GameScene } from './scenes/Game';
import { GameOverScene } from './scenes/GameOver';
import { LeaderboardScene } from './scenes/Leaderboard';
import { LevelClearScene } from './scenes/LevelClear';
import { LevelIntroScene } from './scenes/LevelIntro';
import { LoginScene } from './scenes/Login';
import { TitleScene } from './scenes/Title';

async function start() {
  // Text is rendered to canvas, so the pixel font must be ready before the first frame.
  try {
    await document.fonts.load('16px "Press Start 2P"');
  } catch {
    // fall back to the browser's monospace
  }
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#0b1a2e',
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { gamepad: true },
    scene: [BootScene, TitleScene, LoginScene, LevelIntroScene, GameScene, LevelClearScene, GameOverScene, LeaderboardScene],
  });
  if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
}

void start();
