import Phaser from "phaser";
export const FONT = '"Be Vietnam Pro", sans-serif';
export const MONO = '"Space Mono", monospace';
export const COLORS = {
  cream: 0xf1e5c9,
  ink: 0x233e34,
  mint: 0x98bd98,
  gold: 0xeac08b,
  wood: 0x8b6b44,
};
export function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 14,
  color = "#f1e5c9",
  weight = "normal",
) {
  return scene.add
    .text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      color,
      fontStyle: weight,
      resolution: 2,
      padding: { top: 2, bottom: 5 },
    })
    .setDepth(100);
}
export function panel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  color = COLORS.ink,
  alpha = 0.96,
  r = 10,
) {
  const g = scene.add.graphics().setDepth(99);
  g.fillStyle(color, alpha);
  g.fillRoundedRect(x, y, w, h, r);
  g.lineStyle(1, 0xb6c299, 0.25);
  g.strokeRoundedRect(x + 0.5, y + 0.5, w - 1, h - 1, r);
  return g;
}
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  onClick: () => void,
) {
  const bg = scene.add
    .rectangle(0, 0, w, h, 0xb7cc98)
    .setStrokeStyle(1, 0xe2ddad, 0.5);
  const text = label(scene, 0, 0, title, 14, "#223e32", "bold").setOrigin(0.5);
  const c = scene.add.container(x, y, [bg, text]).setDepth(130);
  bg.setInteractive({ useHandCursor: true })
    .on("pointerdown", onClick)
    .on("pointerover", () => bg.setFillStyle(0xd4ddaf))
    .on("pointerout", () => bg.setFillStyle(0xb7cc98));
  return c;
}
