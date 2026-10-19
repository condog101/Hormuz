import Phaser from 'phaser';
import type { WeaponKey } from '../data/balance';
import { TOUCH } from './Device';
import { TouchControls } from './TouchControls';

/** Keyboard + mouse + gamepad (+ on-canvas touch controls on touch devices) mapped onto the game's actions. */
export class Controls {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private aimAngle = 0;
  private usingPad = false;
  private touch: TouchControls | null = null;

  constructor(private scene: Phaser.Scene) {
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard!.addKeys({
      up: K.W, down: K.S, left: K.A, right: K.D,
      up2: K.UP, down2: K.DOWN, left2: K.LEFT, right2: K.RIGHT,
      fire: K.SPACE, flank: K.SHIFT, ciws: K.E, ciws2: K.Q, pause: K.ESC, pause2: K.P,
      w1: K.ONE, w2: K.TWO, w3: K.THREE, wNext: K.TAB,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
    scene.input.on('pointermove', () => (this.usingPad = false));
    // Pointer.rightButtonReleased() stays true after a release, so latch clicks ourselves.
    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.rightButtonDown()) this.rightClicked = true;
    });
    // Wheel events are latched too and read once per frame by weapon().
    scene.input.on('wheel', (_p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      if (dy !== 0) this.wheel = dy > 0 ? 1 : -1;
    });
    scene.input.mouse?.disableContextMenu();
    if (TOUCH) this.touch = new TouchControls(scene);
  }

  private get pad(): Phaser.Input.Gamepad.Gamepad | undefined {
    const gp = this.scene.input.gamepad;
    return gp && gp.total > 0 ? (gp.getPad(0) ?? undefined) : undefined;
  }

  move(): { x: number; y: number } {
    const k = this.keys;
    let x = (k.right.isDown || k.right2.isDown ? 1 : 0) - (k.left.isDown || k.left2.isDown ? 1 : 0);
    let y = (k.down.isDown || k.down2.isDown ? 1 : 0) - (k.up.isDown || k.up2.isDown ? 1 : 0);
    if (this.touch && x === 0 && y === 0) ({ x, y } = this.touch.moveVector());
    const pad = this.pad;
    if (pad && x === 0 && y === 0) {
      const ax = pad.leftStick.x;
      const ay = pad.leftStick.y;
      if (Math.hypot(ax, ay) > 0.2) {
        x = ax;
        y = ay;
      }
      if (pad.left) x = -1;
      if (pad.right) x = 1;
      if (pad.up) y = -1;
      if (pad.down) y = 1;
    }
    const len = Math.hypot(x, y);
    return len > 1 ? { x: x / len, y: y / len } : { x, y };
  }

  /** Aim angle from the turret at (tx, ty). */
  aim(tx: number, ty: number): number {
    const pad = this.pad;
    if (pad) {
      const rx = pad.rightStick.x;
      const ry = pad.rightStick.y;
      if (Math.hypot(rx, ry) > 0.3) {
        this.usingPad = true;
        this.aimAngle = Math.atan2(ry, rx);
      }
    }
    if (this.touch && !this.usingPad) this.aimAngle = this.touch.aimAngle;
    else if (!this.usingPad) {
      const p = this.scene.input.activePointer;
      this.aimAngle = Math.atan2(p.worldY - ty, p.worldX - tx);
    }
    return this.aimAngle;
  }

  /** Where the player is aiming in the world: the pointer, or 300 px along the stick on a gamepad. */
  aimPoint(tx: number, ty: number): { x: number; y: number } {
    if (this.touch && !this.usingPad) return this.touch.aimPoint(tx, ty);
    if (this.usingPad) return { x: tx + Math.cos(this.aimAngle) * 300, y: ty + Math.sin(this.aimAngle) * 300 };
    const p = this.scene.input.activePointer;
    return { x: p.worldX, y: p.worldY };
  }

  /** Weapon switch this frame: a direct pick (1/2/3 = index 0..2) or a cycle (Tab, wheel, pad Y). */
  weapon(): { select?: number; cycle?: 1 | -1 } {
    const J = Phaser.Input.Keyboard.JustDown;
    const pad = this.pad;
    const padNow = !!(pad && pad.buttons[3]?.pressed);
    const padFired = padNow && !this.padPrev.weapon;
    this.padPrev.weapon = padNow;
    const wheel = this.wheel;
    this.wheel = 0;
    const tapped = !!this.touch?.takeWeaponCycle();
    if (J(this.keys.w1)) return { select: 0 };
    if (J(this.keys.w2)) return { select: 1 };
    if (J(this.keys.w3)) return { select: 2 };
    if (J(this.keys.wNext) || padFired) return { cycle: 1 };
    if (wheel) return { cycle: wheel };
    if (tapped) return { cycle: 1 };
    return {};
  }

  firing(): boolean {
    const pad = this.pad;
    // On touch any finger is the "left button", so only the aim stick fires.
    const pointer = this.touch ? this.touch.firing : this.scene.input.activePointer.leftButtonDown();
    return this.keys.fire.isDown || pointer || !!(pad && (pad.R2 > 0.3 || pad.A));
  }

  flank(): boolean {
    const pad = this.pad;
    return this.keys.flank.isDown || !!this.touch?.flank || !!(pad && (pad.L1 > 0 || pad.L2 > 0.3));
  }

  private padPrev = { ciws: false, pause: false, weapon: false };
  private rightClicked = false;
  private wheel: 0 | 1 | -1 = 0;

  ciws(): boolean {
    const pad = this.pad;
    const padNow = !!(pad && (pad.B || pad.R1 > 0));
    const fired = padNow && !this.padPrev.ciws;
    this.padPrev.ciws = padNow;
    const clicked = this.rightClicked;
    this.rightClicked = false;
    const tapped = !!this.touch?.takeCiws();
    return (
      Phaser.Input.Keyboard.JustDown(this.keys.ciws) ||
      Phaser.Input.Keyboard.JustDown(this.keys.ciws2) ||
      clicked ||
      fired ||
      tapped
    );
  }

  pause(): boolean {
    const pad = this.pad;
    const padNow = !!(pad && pad.buttons[9]?.pressed);
    const fired = padNow && !this.padPrev.pause;
    this.padPrev.pause = padNow;
    const tapped = !!this.touch?.takePause();
    return Phaser.Input.Keyboard.JustDown(this.keys.pause) || Phaser.Input.Keyboard.JustDown(this.keys.pause2) || fired || tapped;
  }

  /** Touch-only hooks; no-ops with keyboard, mouse and gamepad. */
  update(state: { ciwsReady: number; weapon: WeaponKey; turret: { x: number; y: number } }) {
    this.touch?.update(state);
  }

  setWeapon(key: WeaponKey) {
    this.touch?.setWeapon(key);
  }

  setEnabled(on: boolean) {
    this.touch?.setEnabled(on);
  }

  destroy() {
    this.touch?.destroy();
    this.touch = null;
  }
}
