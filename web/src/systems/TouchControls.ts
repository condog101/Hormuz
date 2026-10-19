import Phaser from 'phaser';
import { DEPTH, WEAPONS, WIDTH, type WeaponKey } from '../data/balance';
import { COLORS, panel, text } from './UI';

/** Arrow pad, bottom-left: centre and the distance from it to each arrow's centre. */
const PAD_X = 122;
const PAD_Y = 418;
const PAD_STEP = 76;
const ARROW = 72;
/** A touch this close to the pad centre belongs to the pad. */
const PAD_REACH = 130;
/** Touches nearer the centre than this hold the ship still. */
const PAD_DEAD = 14;
const BTN = 80;
const BTN_X = 908;
/** Extra px around each button that still counts as a hit. */
const SLOP = 8;
const DEPTH_TOUCH = DEPTH.hud + 20;
const GOLD = 0xffd84a;
const CREAM = 0xf3ead7;

type Vec = { x: number; y: number };

interface Button {
  root: Phaser.GameObjects.Container;
  rect: Phaser.Geom.Rectangle;
}

/** Arrow pad, touch-to-aim and on-canvas buttons for the Game scene on touch devices. */
export class TouchControls {
  flank = false;

  /** Pointer holding the arrow pad, and the 8-way direction it points. */
  private padId: number | null = null;
  private dir: Vec = { x: 0, y: 0 };
  /** Pointer aiming the gun, and the last point it touched (the gun keeps that aim after release). */
  private aimId: number | null = null;
  private target: Vec | null = null;
  private enabled = true;
  private ciwsTapped = false;
  private gunTapped = false;
  private pauseTapped = false;

  /** Arrow triangles in right, down, left, up order. */
  private arrows: Phaser.GameObjects.Triangle[] = [];
  private ciwsBtn: Button;
  private ciwsIcon: Phaser.GameObjects.Image;
  private gunBtn: Button;
  private gunIcon: Phaser.GameObjects.Image;
  private flankBtn: Button;
  private flankText: Phaser.GameObjects.Text;
  private flankRing: Phaser.GameObjects.Rectangle;
  private pauseRect: Phaser.Geom.Rectangle;
  private reticle: Phaser.GameObjects.Arc;

  constructor(private scene: Phaser.Scene) {
    const s = scene;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const tri = s.add.triangle(0, 0, 0, 0, 0, 28, 24, 14, CREAM).setAngle(i * 90);
      s.add
        .container(PAD_X + Math.cos(a) * PAD_STEP, PAD_Y + Math.sin(a) * PAD_STEP, [panel(s, -ARROW / 2, -ARROW / 2, ARROW, ARROW), tri])
        .setDepth(DEPTH_TOUCH)
        .setAlpha(0.8);
      this.arrows.push(tri);
    }

    this.ciwsBtn = this.button(228, 'CIWS');
    this.ciwsIcon = s.add.image(0, -8, 'hud_icons', 3).setScale(3);
    this.ciwsBtn.root.add(this.ciwsIcon);
    this.gunBtn = this.button(320, 'GUN');
    this.gunIcon = s.add.image(0, -8, 'hud_icons', WEAPONS.nine.icon).setScale(3);
    this.gunBtn.root.add(this.gunIcon);
    this.flankBtn = this.button(412, 'FLANK');
    this.flankText = text(s, 0, -8, '>>', 16, COLORS.text);
    this.flankRing = s.add.rectangle(0, 0, BTN - 4, BTN - 4).setStrokeStyle(3, GOLD).setVisible(false);
    this.flankBtn.root.add([this.flankText, this.flankRing]);

    this.pauseRect = new Phaser.Geom.Rectangle(WIDTH / 2 - 32 - SLOP, 8 - SLOP, 64 + SLOP * 2, 40 + SLOP * 2);
    s.add
      .container(0, 0, [panel(s, WIDTH / 2 - 32, 8, 64, 40), text(s, WIDTH / 2, 28, 'II', 16, COLORS.gold)])
      .setDepth(DEPTH_TOUCH)
      .setAlpha(0.85);

    // Ring around the aiming finger, wide enough to show past the thumb.
    this.reticle = s.add.circle(0, 0, 30).setStrokeStyle(2, GOLD, 0.8).setDepth(DEPTH_TOUCH).setVisible(false);

    s.input.on('pointerdown', this.onDown, this);
    s.input.on('pointermove', this.onMove, this);
    s.input.on('pointerup', this.onUp, this);
    s.input.on('pointerupoutside', this.onUp, this);
    s.game.events.on(Phaser.Core.Events.BLUR, this.releaseAll, this);
  }

  private button(y: number, label: string): Button {
    const s = this.scene;
    const root = s.add
      .container(BTN_X, y, [panel(s, -BTN / 2, -BTN / 2, BTN, BTN), text(s, 0, 26, label, 8, COLORS.dim)])
      .setDepth(DEPTH_TOUCH)
      .setAlpha(0.85);
    const rect = new Phaser.Geom.Rectangle(BTN_X - BTN / 2 - SLOP, y - BTN / 2 - SLOP, BTN + SLOP * 2, BTN + SLOP * 2);
    return { root, rect };
  }

  private press(b: Button) {
    this.scene.tweens.add({ targets: b.root, scale: { from: 0.9, to: 1 }, duration: 120 });
  }

  private onDown(p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) {
    // A tap on an interactive object (the pause menu) is not a game control.
    if (over.length > 0) return;
    const { x, y } = p;
    const hit = (r: Phaser.Geom.Rectangle) => Phaser.Geom.Rectangle.Contains(r, x, y);
    if (hit(this.pauseRect)) {
      this.pauseTapped = true;
      return;
    }
    if (!this.enabled) return;
    if (hit(this.ciwsBtn.rect)) {
      this.ciwsTapped = true;
      this.press(this.ciwsBtn);
    } else if (hit(this.gunBtn.rect)) {
      this.gunTapped = true;
      this.press(this.gunBtn);
    } else if (hit(this.flankBtn.rect)) {
      this.flank = !this.flank;
      this.press(this.flankBtn);
    } else if (Math.hypot(x - PAD_X, y - PAD_Y) < PAD_REACH) {
      if (this.padId === null) {
        this.padId = p.id;
        this.steer(p);
      }
    } else if (this.aimId === null) {
      this.aimId = p.id;
      this.aimAt(p);
    }
  }

  private onMove(p: Phaser.Input.Pointer) {
    if (p.id === this.padId) this.steer(p);
    if (p.id === this.aimId) this.aimAt(p);
  }

  /** 8-way direction from the pad centre: a thumb between two arrows goes diagonally. */
  private steer(p: Phaser.Input.Pointer) {
    const dx = p.x - PAD_X;
    const dy = p.y - PAD_Y;
    if (Math.hypot(dx, dy) < PAD_DEAD) this.dir = { x: 0, y: 0 };
    else {
      const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
      this.dir = { x: Math.round(Math.cos(a)), y: Math.round(Math.sin(a)) };
    }
    this.lightArrows();
  }

  private lightArrows() {
    const { x, y } = this.dir;
    const lit = [x > 0, y > 0, x < 0, y < 0];
    this.arrows.forEach((t, i) => t.setFillStyle(lit[i] ? GOLD : CREAM));
  }

  private aimAt(p: Phaser.Input.Pointer) {
    this.target = { x: p.worldX, y: p.worldY };
    this.reticle.setPosition(p.worldX, p.worldY).setVisible(true);
  }

  private onUp(p: Phaser.Input.Pointer) {
    if (p.id === this.padId) this.releasePad();
    if (p.id === this.aimId) this.releaseAim();
  }

  private releasePad() {
    this.padId = null;
    this.dir = { x: 0, y: 0 };
    this.lightArrows();
  }

  private releaseAim() {
    this.aimId = null;
    this.reticle.setVisible(false);
  }

  private releaseAll() {
    this.releasePad();
    this.releaseAim();
  }

  /** Direction from the arrow pad; Controls normalises diagonals. */
  moveVector(): Vec {
    return this.dir;
  }

  /** The gun fires while a finger is down on the water. */
  get firing(): boolean {
    return this.aimId !== null;
  }

  /** Angle from the turret to the last touched point, or null before the first touch. */
  aimAngle(tx: number, ty: number): number | null {
    return this.target ? Math.atan2(this.target.y - ty, this.target.x - tx) : null;
  }

  /** THE 808 lobs to the touched point. */
  aimPoint(): Vec | null {
    return this.target;
  }

  takeCiws(): boolean {
    const t = this.ciwsTapped;
    this.ciwsTapped = false;
    return t;
  }

  takeWeaponCycle(): boolean {
    const t = this.gunTapped;
    this.gunTapped = false;
    return t;
  }

  takePause(): boolean {
    const t = this.pauseTapped;
    this.pauseTapped = false;
    return t;
  }

  /** While disabled (paused) only the pause pill responds. */
  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) {
      this.releaseAll();
      this.ciwsTapped = false;
      this.gunTapped = false;
    }
  }

  setWeapon(key: WeaponKey) {
    this.gunIcon.setFrame(WEAPONS[key].icon);
  }

  update(state: { ciwsReady: number }) {
    // Drop pointers whose end event never reached us (touchcancel, overlay, tab switch).
    const down = (id: number) => this.scene.input.manager.pointers.some((p) => p.id === id && p.isDown);
    if (this.padId !== null && !down(this.padId)) this.releasePad();
    if (this.aimId !== null && !down(this.aimId)) this.releaseAim();

    this.ciwsIcon.setAlpha(state.ciwsReady >= 1 ? 1 : 0.4);
    this.flankRing.setVisible(this.flank);
    this.flankText.setColor(this.flank ? COLORS.gold : COLORS.text);
  }

  destroy() {
    const s = this.scene;
    s.input.off('pointerdown', this.onDown, this);
    s.input.off('pointermove', this.onMove, this);
    s.input.off('pointerup', this.onUp, this);
    s.input.off('pointerupoutside', this.onUp, this);
    s.game.events.off(Phaser.Core.Events.BLUR, this.releaseAll, this);
  }
}
