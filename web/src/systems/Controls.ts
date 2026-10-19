import Phaser from 'phaser';

/** Keyboard + mouse + gamepad mapped onto the game's actions. */
export class Controls {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private aimAngle = 0;
  private usingPad = false;

  constructor(private scene: Phaser.Scene) {
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard!.addKeys({
      up: K.W, down: K.S, left: K.A, right: K.D,
      up2: K.UP, down2: K.DOWN, left2: K.LEFT, right2: K.RIGHT,
      fire: K.SPACE, flank: K.SHIFT, ciws: K.E, ciws2: K.Q, pause: K.ESC, pause2: K.P,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
    scene.input.on('pointermove', () => (this.usingPad = false));
    scene.input.mouse?.disableContextMenu();
  }

  private get pad(): Phaser.Input.Gamepad.Gamepad | undefined {
    const gp = this.scene.input.gamepad;
    return gp && gp.total > 0 ? (gp.getPad(0) ?? undefined) : undefined;
  }

  move(): { x: number; y: number } {
    const k = this.keys;
    let x = (k.right.isDown || k.right2.isDown ? 1 : 0) - (k.left.isDown || k.left2.isDown ? 1 : 0);
    let y = (k.down.isDown || k.down2.isDown ? 1 : 0) - (k.up.isDown || k.up2.isDown ? 1 : 0);
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
    if (!this.usingPad) {
      const p = this.scene.input.activePointer;
      this.aimAngle = Math.atan2(p.worldY - ty, p.worldX - tx);
    }
    return this.aimAngle;
  }

  firing(): boolean {
    const pad = this.pad;
    return (
      this.keys.fire.isDown ||
      this.scene.input.activePointer.leftButtonDown() ||
      !!(pad && (pad.R2 > 0.3 || pad.A))
    );
  }

  flank(): boolean {
    const pad = this.pad;
    return this.keys.flank.isDown || !!(pad && (pad.L1 > 0 || pad.L2 > 0.3));
  }

  private padPrev = { ciws: false, pause: false };

  ciws(): boolean {
    const pad = this.pad;
    const padNow = !!(pad && (pad.B || pad.R1 > 0));
    const fired = padNow && !this.padPrev.ciws;
    this.padPrev.ciws = padNow;
    return (
      Phaser.Input.Keyboard.JustDown(this.keys.ciws) ||
      Phaser.Input.Keyboard.JustDown(this.keys.ciws2) ||
      this.scene.input.activePointer.rightButtonReleased() ||
      fired
    );
  }

  pause(): boolean {
    const pad = this.pad;
    const padNow = !!(pad && pad.buttons[9]?.pressed);
    const fired = padNow && !this.padPrev.pause;
    this.padPrev.pause = padNow;
    return Phaser.Input.Keyboard.JustDown(this.keys.pause) || Phaser.Input.Keyboard.JustDown(this.keys.pause2) || fired;
  }
}
