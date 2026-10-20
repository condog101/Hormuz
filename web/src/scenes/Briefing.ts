import Phaser from 'phaser';
import { HEIGHT, OX, PX, WIDTH } from '../data/balance';
import { GUESTS, renderLine } from '../data/quotes';
import type { InputText, Tweet } from '../data/story';
import { Audio } from '../systems/Audio';
import { byInput, TOUCH } from '../systems/Device';
import { COLORS, FONT, onContinue, panel, text } from '../systems/UI';

const PANEL_X = OX + 140;
const PANEL_Y = 96;
const PANEL_W = 680;
const PANEL_H = 348;
const LEFT = PANEL_X + 24;

export interface BriefingData {
  cards: Tweet[];
  next: string;
  nextData: object;
}

const resolve = (t: InputText) => (typeof t === 'string' ? t : byInput(t.desktop, t.touch));

/** Big Don's posts between tracks: a deck of tweet cards, one tap or key per card, then on to `next`. */
export class BriefingScene extends Phaser.Scene {
  private data_!: BriefingData;
  private card!: Phaser.GameObjects.Container;

  constructor() {
    super('Briefing');
  }

  init(data: BriefingData) {
    this.data_ = data;
  }

  create() {
    this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'tiles', 0).setOrigin(0).setTileScale(PX).setAlpha(0.5);
    panel(this, PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
    const go = text(this, WIDTH / 2, PANEL_Y + PANEL_H + 34, byInput('PRESS ANY KEY', 'TAP'), 16, COLORS.gold);
    this.tweens.add({ targets: go, alpha: 0.2, yoyo: true, repeat: -1, duration: 500 });
    this.card = this.add.container(0, 0);
    this.cameras.main.fadeIn(250);
    this.show(0);
  }

  private show(i: number) {
    const { cards, next, nextData } = this.data_;
    if (i >= cards.length) {
      this.scene.start(next, nextData);
      return;
    }
    const tw = cards[i];
    const c = this.card;
    c.removeAll(true);

    // header: Don's avatar, name, handle and the time he posts everything
    c.add(this.add.sprite(LEFT, PANEL_Y + 20, 'potus', 0).setOrigin(0).setScale(1.5).setCrop(0, 0, 64, 56));
    c.add(text(this, LEFT + 112, PANEL_Y + 44, 'BIG DON', 16, COLORS.gold, 0).setOrigin(0, 0.5));
    c.add(text(this, LEFT + 112, PANEL_Y + 72, '@BigDon · 3:12 AM', 8, COLORS.dim, 0).setOrigin(0, 0.5));

    const raw = resolve(tw.text);
    const body = this.add
      .text(LEFT, PANEL_Y + 116, renderLine(raw), {
        fontFamily: FONT,
        fontSize: TOUCH ? '14px' : '10px',
        color: COLORS.text,
        lineSpacing: 6,
        wordWrap: { width: 600 },
      })
      .setOrigin(0);
    c.add(body);

    const y = body.y + body.height + 16;
    if (tw.reply) {
      const g = GUESTS[tw.reply.who];
      c.add(this.add.rectangle(LEFT, y - 6, 632, 1, 0x5a6d8c).setOrigin(0));
      c.add(this.add.sprite(LEFT, y, 'guests', g.frame).setOrigin(0).setCrop(0, 0, 64, 56));
      c.add(text(this, LEFT + 76, y + 8, g.name, 8, COLORS.gold, 0).setOrigin(0, 0.5));
      c.add(
        this.add
          .text(LEFT + 76, y + 22, renderLine(tw.reply.text), {
            fontFamily: FONT,
            fontSize: TOUCH ? '12px' : '8px',
            color: COLORS.text,
            lineSpacing: 6,
            wordWrap: { width: 540 },
          })
          .setOrigin(0),
      );
    }

    const footY = PANEL_Y + PANEL_H - 22;
    if (tw.stats) c.add(text(this, LEFT, footY, tw.stats, 8, COLORS.dim, 0).setOrigin(0, 0.5));
    c.add(text(this, PANEL_X + PANEL_W - 24, footY, `${i + 1}/${cards.length}`, 8, COLORS.dim, 0).setOrigin(1, 0.5));

    Audio.play('incoming');
    const bleeps = (raw.match(/\{[^}]*\}/g) ?? []).length;
    for (let k = 0; k < bleeps; k++) this.time.delayedCall(300 + k * 260, () => Audio.play('bleep', { volume: 0.6 }));
    onContinue(this, () => this.show(i + 1), 250);
  }
}
