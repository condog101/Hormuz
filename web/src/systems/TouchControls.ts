import Phaser from 'phaser';
import { DEPTH, WEAPONS, WIDTH, type WeaponKey } from '../data/balance';
import { COLORS, panel, text } from './UI';

/** Stick travel in canvas px for full deflection. */
const RADIUS = 64;
const DEAD_ZONE = 0.15;
/** Aim stick deflection needed to turn the turret and fire. */
const AIM_MIN = 0.2;
const BTN = 80;
const BTN_X = 908;
/** Extra px around each button that still counts as a hit. */
const SLOP = 8;
const DEPTH_TOUCH = DEPTH.hud + 20;

type Vec = { x: number; y: number };

interface Stick {
  id: number;
  base: Vec;
  vec: Vec;
  deflection: number;
}

interface Button {
  root: Phaser.GameObjects.Container;
  rect: Phaser.Geom.Rectangle;
}

/** Floating twin sticks and on-canvas buttons for the Game scene on touch devices. */
export class TouchControls {
  aimAngle = 0;
  flank = false;

  private move: Stick | null = null;
  private aim: Stick | null = null;
  private aimDeflection = 1;
  private enabled = true;
  private ciwsTapped = false;
  private gunTapped = false;
  private pauseTapped = false;

  private moveGfx: Phaser.GameObjects.Arc[];
  private aimGfx: Phaser.GameObjects.Arc[];
  private ciwsBtn: Button;
  private ciwsIcon: Phaser.GameObjects.Image;
  private gunBtn: Button;
  private gunIcon: Phaser.GameObjects.Image;
  private flankBtn: Button;
  private flankText: Phaser.GameObjects.Text;
  private flankRing: Phaser.GameObjects.Rectangle;
  private pauseRect: Phaser.Geom.Rectangle;
  private dot: Phaser.GameObjects.Arc;

  constructor(private scene: Phaser.Scene) {
    const s = scene;
    this.moveGfx = this.stickGfx();
    this.aimGfx = this.stickGfx();

    this.ciwsBtn = this.button(228, 'CIWS');
    this.ciwsIcon = s.add.image(0, -8, 'hud_icons', 3).setScale(3);
    this.ciwsBtn.root.add(this.ciwsIcon);
    this.gunBtn = this.button(320, 'GUN');
    this.gunIcon = s.add.image(0, -8, 'hud_icons', WEAPONS.nine.icon).setScale(3);
    this.gunBtn.root.add(this.gunIcon);
    this.flankBtn = this.button(412, 'FLANK');
    this.flankText = text(s, 0, -8, '>>', 16, COLORS.text);
    this.flankRing = s.add.rectangle(0, 0, BTN - 4, BTN - 4).setStrokeStyle(3, 0xffd84a).setVisible(false);
    this.flankBtn.root.add([this.flankText, this.flankRing]);

    this.pauseRect = new Phaser.Geom.Rectangle(WIDTH / 2 - 32 - SLOP, 8 - SLOP, 64 + SLOP * 2, 40 + SLOP * 2);
    s.add
      .container(0, 0, [panel(s, WIDTH / 2 - 32, 8, 64, 40), text(s, WIDTH / 2, 28, 'II', 16, COLORS.gold)])
      .setDepth(DEPTH_TOUCH)
      .setAlpha(0.85);

    this.dot = s.add.circle(0, 0, 5, 0xffd84a).setStrokeStyle(2, 0x000000).setDepth(DEPTH_TOUCH).setVisible(false);

    s.input.on('pointerdown', this.onDown, this);
    s.input.on('pointermove', this.onMove, this);
    s.input.on('pointerup', this.onUp, this);
    s.input.on('pointerupoutside', this.onUp, this);
    s.game.events.on(Phaser.Core.Events.BLUR, this.releaseAll, this);
  }

  private stickGfx(): Phaser.GameObjects.Arc[] {
    const s = this.scene;
    const base = s.add.circle(0, 0, RADIUS, 0xffffff, 0.08).setStrokeStyle(2, 0xffd84a, 0.5);
    const knob = s.add.circle(0, 0, 22, 0xffd84a, 0.45).setStrokeStyle(2, 0x000000, 0.6);
    return [base, knob].map((c) => c.setDepth(DEPTH_TOUCH).setVisible(false));
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
    // A tap on an interactive object (the pause menu) is not a stick or button press.
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
    } else if (x < WIDTH / 2) {
      if (y > 96 && !this.move) this.move = this.grab(p, this.moveGfx);
    } else if (!this.aim) {
      this.aim = this.grab(p, this.aimGfx);
    }
  }

  private grab(p: Phaser.Input.Pointer, gfx: Phaser.GameObjects.Arc[]): Stick {
    gfx.forEach((g) => g.setPosition(p.x, p.y).setVisible(true));
    return { id: p.id, base: { x: p.x, y: p.y }, vec: { x: 0, y: 0 }, deflection: 0 };
  }

  private onMove(p: Phaser.Input.Pointer) {
    if (this.move?.id === p.id) this.drag(this.move, p, this.moveGfx);
    if (this.aim?.id === p.id) {
      this.drag(this.aim, p, this.aimGfx);
      if (this.aim.deflection > AIM_MIN) {
        this.aimAngle = Math.atan2(this.aim.vec.y, this.aim.vec.x);
        this.aimDeflection = this.aim.deflection;
      }
    }
  }

  private drag(st: Stick, p: Phaser.Input.Pointer, [base, knob]: Phaser.GameObjects.Arc[]) {
    let dx = p.x - st.base.x;
    let dy = p.y - st.base.y;
    const d = Math.hypot(dx, dy);
    // Past 1.5 radii the base trails the finger, so the thumb never has to come back to the start.
    if (d > RADIUS * 1.5) {
      const k = (d - RADIUS * 1.5) / d;
      st.base.x += dx * k;
      st.base.y += dy * k;
      dx = p.x - st.base.x;
      dy = p.y - st.base.y;
    }
    const len = Math.min(1, Math.hypot(dx, dy) / RADIUS);
    const ang = Math.atan2(dy, dx);
    st.deflection = len;
    st.vec = len < DEAD_ZONE ? { x: 0, y: 0 } : { x: Math.cos(ang) * len, y: Math.sin(ang) * len };
    base.setPosition(st.base.x, st.base.y);
    knob.setPosition(st.base.x + Math.cos(ang) * len * RADIUS, st.base.y + Math.sin(ang) * len * RADIUS);
  }

  private onUp(p: Phaser.Input.Pointer) {
    if (this.move?.id === p.id) this.releaseMove();
    if (this.aim?.id === p.id) this.releaseAim();
  }

  private releaseMove() {
    this.move = null;
    this.moveGfx.forEach((g) => g.setVisible(false));
  }

  private releaseAim() {
    this.aim = null;
    this.aimGfx.forEach((g) => g.setVisible(false));
  }

  private releaseAll() {
    this.releaseMove();
    this.releaseAim();
  }

  /** Analog move vector, length <= 1. */
  moveVector(): Vec {
    return this.move ? this.move.vec : { x: 0, y: 0 };
  }

  get firing(): boolean {
    return !!this.aim && this.aim.deflection > AIM_MIN;
  }

  /** Aim point along the stick: full deflection reaches THE 808's 380 px range. */
  aimPoint(tx: number, ty: number): Vec {
    const r = 80 + this.aimDeflection * 300;
    return { x: tx + Math.cos(this.aimAngle) * r, y: ty + Math.sin(this.aimAngle) * r };
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

  update(state: { ciwsReady: number; weapon: WeaponKey; turret: Vec }) {
    // Drop pointers whose end event never reached us (touchcancel, overlay, tab switch).
    const pointers = this.scene.input.manager.pointers;
    const down = (st: Stick) => pointers.some((p) => p.id === st.id && p.isDown);
    if (this.move && !down(this.move)) this.releaseMove();
    if (this.aim && !down(this.aim)) this.releaseAim();

    this.ciwsIcon.setAlpha(state.ciwsReady >= 1 ? 1 : 0.4);
    this.flankRing.setVisible(this.flank);
    this.flankText.setColor(this.flank ? COLORS.gold : COLORS.text);
    if (state.weapon === 'boom') {
      const a = this.aimPoint(state.turret.x, state.turret.y);
      this.dot.setPosition(a.x, a.y).setVisible(true);
    } else this.dot.setVisible(false);
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
