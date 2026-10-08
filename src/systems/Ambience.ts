import Phaser from "phaser";
import { Painter } from "../art/Painter";
export class Ambience {
  private scooter: Phaser.GameObjects.Image;
  private fan: Phaser.GameObjects.Graphics;
  private steam: Phaser.GameObjects.Graphics;
  private reflections: Phaser.GameObjects.Graphics;
  private rain: Phaser.GameObjects.Graphics;
  private elapsed = 0;
  constructor(private scene: Phaser.Scene) {
    if (!scene.textures.exists("scooter")) {
      const texture = scene.textures.createCanvas("scooter", 48, 32)!;
      const p = new Painter(texture.context);
      p.ellipse(10, 27, 6, 5, "#183830");
      p.ellipse(37, 27, 6, 5, "#183830");
      p.ellipse(10, 27, 3, 3, "#b2c2a1");
      p.ellipse(37, 27, 3, 3, "#b2c2a1");
      p.poly(
        [
          [7, 22],
          [16, 16],
          [31, 17],
          [34, 12],
          [40, 12],
          [43, 22],
          [34, 25],
          [11, 25],
        ],
        "#bf916c",
      );
      p.rect(16, 12, 19, 3, "#324b3d");
      p.rect(40, 12, 3, 7, "#e2bf7b");
      p.rect(25, 8, 5, 13, "#486a58");
      p.rect(21, 2, 9, 7, "#d4b084");
      p.rect(20, 1, 10, 4, "#80936e");
      p.rect(19, 13, 5, 9, "#b7aa7c");
      texture.refresh();
    }
    this.scooter = scene.add
      .image(-100, 492, "scooter")
      .setScale(1.3)
      .setDepth(2)
      .setAlpha(0.8);
    this.fan = scene.add.graphics().setPosition(1264, 226).setDepth(4);
    for (let i = 0; i < 3; i++) {
      this.fan.fillStyle(0xb7c3a0, 0.55);
      this.fan.fillEllipse(
        Math.cos((i * Math.PI * 2) / 3) * 15,
        Math.sin((i * Math.PI * 2) / 3) * 15,
        18,
        9,
      );
    }
    this.steam = scene.add.graphics().setDepth(5);
    this.reflections = scene.add.graphics().setDepth(3);
    this.rain = scene.add.graphics().setDepth(3);
    // Soft lights, rather than filters or postprocessing, keep the scene lightweight.
    if (!scene.textures.exists("warm-light")) {
      const light = scene.textures.createCanvas("warm-light", 160, 160)!;
      const ctx = light.context;
      const g = ctx.createRadialGradient(80, 80, 0, 80, 80, 80);
      g.addColorStop(0, "#ffdc9540");
      g.addColorStop(1, "#ffcc6600");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 160, 160);
      light.refresh();
    }
    for (const [x, y] of [
      [314, 248],
      [718, 327],
      [1124, 248],
    ])
      scene.add
        .image(x, y, "warm-light")
        .setScale(1.8)
        .setDepth(6)
        .setBlendMode(Phaser.BlendModes.ADD);
  }
  update(dt: number, rainy: boolean) {
    this.elapsed += dt;
    this.scooter.x = ((this.elapsed * 95) % 1700) - 100;
    this.fan.rotation = this.elapsed * 4;
    this.steam.clear();
    this.steam.lineStyle(2, 0xefdfb2, 0.3);
    for (let i = 0; i < 4; i++) {
      const t = (this.elapsed * 0.25 + i / 4) % 1;
      const x = 354 + Math.sin(t * 6 + i) * 8;
      this.steam.lineBetween(x, 345 - t * 48, x + 3, 337 - t * 48);
    }
    this.reflections.clear().fillStyle(0xd8ebc8, 0.025);
    this.reflections.fillTriangle(77, 160, 186, 160, 77, 530);
    this.reflections.fillTriangle(1330, 159, 1370, 159, 1210, 533);
    this.rain.clear();
    if (rainy) {
      this.rain.lineStyle(1, 0xb2cac1, 0.24);
      for (let i = 0; i < 80; i++) {
        const x = (i * 73 + this.elapsed * 30) % 1440,
          y = 170 + ((i * 53 + this.elapsed * 310) % 330);
        this.rain.lineBetween(x, y, x - 5, y + 13);
      }
    }
  }
}
