import Phaser from "phaser";
import { label } from "./Toolkit";
import type { ServiceScene } from "../scenes/ServiceScene";
export class TouchControls {
  direction = 0;
  run = false;
  held = false;
  private movePointer: number | null = null;
  private interactPointer: number | null = null;
  constructor(private scene: ServiceScene) {
    if (!scene.sys.game.device.input.touch && window.innerWidth > 800) return;
    const make = (x: number, y: number, r: number, text: string) => {
      const bg = scene.add
        .circle(x, y, r, 0x264737, 0.85)
        .setStrokeStyle(2, 0xd4d9ae, 0.7)
        .setInteractive()
        .setDepth(180);
      label(scene, x, y, text, 25, "#efdfb8", "bold")
        .setOrigin(0.5)
        .setDepth(181);
      return bg;
    };
    for (const [x, dir, text] of [
      [100, -1, "←"],
      [266, 1, "→"],
    ] as [number, number, string][]) {
      const b = make(x, 697, 72, text);
      b.on("pointerdown", (p: Phaser.Input.Pointer) => {
        this.movePointer = p.id;
        this.direction = dir;
      })
        .on("pointerup", (p: Phaser.Input.Pointer) => this.release(p))
        .on("pointerout", (p: Phaser.Input.Pointer) => this.release(p));
    }
    make(183, 587, 45, "»").on("pointerdown", () => (this.run = !this.run));
    const interact = make(1323, 678, 79, "E");
    interact
      .on("pointerdown", (p: Phaser.Input.Pointer) => {
        this.interactPointer = p.id;
        this.held = true;
        scene.interact();
      })
      .on("pointerup", (p: Phaser.Input.Pointer) => this.release(p))
      .on("pointerout", (p: Phaser.Input.Pointer) => this.release(p));
    scene.input.on("pointerup", (p: Phaser.Input.Pointer) => this.release(p));
  }
  private release(pointer: Phaser.Input.Pointer) {
    if (pointer.id === this.movePointer) {
      this.movePointer = null;
      this.direction = 0;
    }
    if (pointer.id === this.interactPointer) {
      this.interactPointer = null;
      this.held = false;
      this.scene.stationController.releaseTea();
    }
  }
}
