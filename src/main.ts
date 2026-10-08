import Phaser from "phaser";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "@fontsource/space-mono/400.css";
import "./style.css";
import { ServiceScene } from "./scenes/ServiceScene";
await Promise.all([
  document.fonts.load(
    '400 16px "Be Vietnam Pro"',
    "Tiệm Trà Mơ ĐƯỜNG ĐÁ ộ ế ắ",
  ),
  document.fonts.load(
    '700 16px "Be Vietnam Pro"',
    "Tiệm Trà Mơ ĐƯỜNG ĐÁ ộ ế ắ",
  ),
  document.fonts.load('400 12px "Space Mono"'),
]);
const game = new Phaser.Game({
  type: Phaser.CANVAS,
  parent: "game",
  width: 1440,
  height: 850,
  backgroundColor: "#172f31",
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [ServiceScene],
  input: { keyboard: true, touch: true, activePointers: 3 },
  render: { antialias: false },
});
(window as any).__PHASER_GAME__ = game;
