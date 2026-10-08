import Phaser from "phaser";
import type { BaseStation } from "../stations/BaseStation";
import { label, panel } from "./Toolkit";
export class StationUI {
  container: Phaser.GameObjects.Container;
  title: Phaser.GameObjects.Text;
  progress: Phaser.GameObjects.Graphics;
  rows: Phaser.GameObjects.Text[] = [];
  help: Phaser.GameObjects.Text;
  visible = false;
  constructor(scene: Phaser.Scene) {
    const bg = panel(scene, -152, -166, 304, 190, 0xeee0bd, 1, 9);
    this.title = label(scene, 0, -148, "", 15, "#2d4838", "bold").setOrigin(
      0.5,
    );
    for (let i = 0; i < 5; i++)
      this.rows.push(
        label(scene, -126, -123 + i * 22, "", 13, "#526349").setPadding(
          0,
          2,
          0,
          2,
        ),
      );
    this.help = label(scene, 0, -35, "", 10, "#677658").setOrigin(0.5);
    this.progress = scene.add.graphics();
    this.container = scene.add
      .container(0, 0, [bg, this.title, ...this.rows, this.help, this.progress])
      .setDepth(115)
      .setVisible(false);
  }
  open(
    station: BaseStation,
    title: string,
    options: string[],
    onSelect?: (i: number) => void,
    help = "Chọn bằng phím số hoặc chạm",
  ) {
    this.visible = true;
    this.container
      .setPosition(Phaser.Math.Clamp(station.x, 162, 1278), 453)
      .setVisible(true);
    this.title.setText(title);
    this.progress.clear();
    this.help.setText(options.length > 3 ? "" : help);
    this.rows.forEach((text, i) => {
      text.removeAllListeners();
      text.disableInteractive();
      text.setVisible(i < options.length).setText(options[i] ?? "");
      if (onSelect && i < options.length) {
        text
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", () => onSelect(i))
          .on("pointerover", () => text.setColor("#253f30"))
          .on("pointerout", () => text.setColor("#526349"));
      }
    });
  }
  setProgress(value: number, perfect = true) {
    const g = this.progress;
    g.clear().fillStyle(0xb6b899).fillRoundedRect(-122, 2, 244, 10, 3);
    if (perfect)
      g.fillStyle(0x84aa70).fillRect(-122 + 244 * 0.62, 2, 244 * 0.2, 10);
    g.fillStyle(0x3c6a50).fillRoundedRect(
      -122,
      2,
      244 * Math.min(value, 1),
      10,
      3,
    );
    g.fillStyle(0xf7edcf).fillRect(-124 + 244 * Math.min(value, 1), -1, 4, 16);
  }
  close() {
    this.visible = false;
    this.container.setVisible(false);
    this.progress.clear();
  }
}
