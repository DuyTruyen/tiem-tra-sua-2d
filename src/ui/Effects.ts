import Phaser from "phaser";
import { label } from "./Toolkit";
/** Small pools keep rewards and sparks reusable during long service sessions. */
export class Effects {
  private texts: Phaser.GameObjects.Text[] = [];
  private sparks: Phaser.GameObjects.Rectangle[] = [];
  constructor(private scene: Phaser.Scene) {
    for (let i = 0; i < 12; i++)
      this.texts.push(
        label(scene, 0, 0, "", 19, "#f8de9a", "bold")
          .setOrigin(0.5)
          .setVisible(false)
          .setDepth(150),
      );
    for (let i = 0; i < 32; i++)
      this.sparks.push(
        scene.add
          .rectangle(0, 0, 4, 4, 0xeec98b)
          .setDepth(130)
          .setVisible(false),
      );
  }
  float(x: number, y: number, text: string, color = "#f8de9a") {
    const t = this.texts.find((t) => !t.visible);
    if (!t) return;
    t.setText(text)
      .setColor(color)
      .setPosition(x, y)
      .setAlpha(1)
      .setVisible(true)
      .setScale(1);
    this.scene.tweens.add({
      targets: t,
      y: y - 65,
      alpha: 0,
      duration: 1500,
      ease: "Cubic.Out",
      onComplete: () => t.setVisible(false),
    });
  }
  burst(x: number, y: number) {
    this.sparks
      .filter((s) => !s.visible)
      .slice(0, 10)
      .forEach((s, i) => {
        s.setPosition(x, y).setVisible(true).setAlpha(1).setScale(1);
        const a = (i * Math.PI) / 5;
        this.scene.tweens.add({
          targets: s,
          x: x + Math.cos(a) * 55,
          y: y + Math.sin(a) * 35 - 20,
          alpha: 0,
          scale: 0.3,
          duration: 700,
          onComplete: () => s.setVisible(false),
        });
      });
  }
}
