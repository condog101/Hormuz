import Phaser from 'phaser';
import { Audio } from './Audio';

export const FONT = '"Press Start 2P"';

export const COLORS = {
  text: '#f3ead7',
  dim: '#8c8577',
  gold: '#ffd84a',
  red: '#ff4a4a',
  green: '#6dff8f',
  purple: '#b26bff',
  navy: 0x0d1b33,
};

export function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  str: string,
  size = 16,
  color = COLORS.text,
  origin = 0.5,
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, align: 'center', lineSpacing: Math.round(size / 2) })
    .setOrigin(origin)
    .setStroke('#000000', Math.max(2, size / 4));
}

/** 9-slice black-and-gold panel at 2x pixel scale. Coordinates are its top-left. */
export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
  return scene.add.nineslice(x, y, 'ui_panel', 0, w / 2, h / 2, 8, 8, 8, 8).setOrigin(0).setScale(2);
}

export interface MenuItem {
  label: string;
  action: () => void;
  enabled?: boolean;
}

/** Vertical keyboard/mouse/gamepad menu. Returns a function to rebuild with new items. */
export function menu(scene: Phaser.Scene, x: number, y: number, items: MenuItem[], gap = 30) {
  let index = items.findIndex((i) => i.enabled !== false);
  const texts = items.map((item, i) => {
    const t = text(scene, x, y + i * gap, item.label, 16, item.enabled === false ? '#4a5870' : COLORS.text);
    if (item.enabled !== false) {
      t.setInteractive({ useHandCursor: true })
        .on('pointerover', () => select(i))
        .on('pointerdown', () => activate());
    }
    return t;
  });
  const cursor = text(scene, 0, 0, '>', 16, COLORS.gold);

  function select(i: number) {
    if (i !== index) Audio.play('blip');
    index = i;
    texts.forEach((t, j) => t.setColor(items[j].enabled === false ? '#4a5870' : j === i ? COLORS.gold : COLORS.text));
    const t = texts[i];
    cursor.setPosition(t.x - t.width / 2 - 20, t.y);
  }

  function activate() {
    Audio.unlock();
    Audio.play('select');
    items[index].action();
  }

  function moveBy(d: number) {
    let i = index;
    do i = (i + d + items.length) % items.length;
    while (items[i].enabled === false);
    select(i);
  }

  const kb = scene.input.keyboard!;
  const onKey = (e: KeyboardEvent) => {
    if (e.repeat && (e.code === 'Enter' || e.code === 'Space')) return;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') moveBy(-1);
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') moveBy(1);
    else if (e.code === 'Enter' || e.code === 'Space') activate();
  };
  kb.on('keydown', onKey);
  const pad = scene.input.gamepad;
  const onPad = (_p: unknown, button: Phaser.Input.Gamepad.Button) => {
    if (button.index === 12) moveBy(-1);
    else if (button.index === 13) moveBy(1);
    else if (button.index === 0 || button.index === 9) activate();
  };
  pad?.on('down', onPad);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    kb.off('keydown', onKey);
    pad?.off('down', onPad);
  });
  if (index >= 0) select(index);
  return {
    destroy() {
      texts.forEach((t) => t.destroy());
      cursor.destroy();
      kb.off('keydown', onKey);
      pad?.off('down', onPad);
    },
  };
}

/** "Press any key" style continue prompt. */
export function onContinue(scene: Phaser.Scene, fn: () => void, delayMs = 400) {
  scene.time.delayedCall(delayMs, () => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      Audio.unlock();
      Audio.play('select');
      fn();
    };
    // Ignore auto-repeat from a key held down on the previous screen.
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      scene.input.keyboard!.off('keydown', onKey);
      go();
    };
    scene.input.keyboard!.on('keydown', onKey);
    scene.input.once('pointerdown', go);
    scene.input.gamepad?.once('down', go);
  });
}
