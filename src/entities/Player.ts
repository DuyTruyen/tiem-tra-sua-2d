import Phaser from "phaser";
export class Player {
  sprite: Phaser.GameObjects.Image;
  x = 210;
  velocity = 0;
  direction = 1;
  moving = false;
  sprinting = false;
  speedModifier = 1;
  private time = 0;
  constructor(private scene: Phaser.Scene) {
    this.sprite = scene.add
      .image(this.x, 568, "player-0")
      .setOrigin(0.5, 1)
      .setScale(1.85)
      .setDepth(20);
  }
  update(dt: number, dir: number, run: boolean, carry = 0) {
    this.sprinting = run && dir !== 0;
    const max =
      (run ? 360 : 245) *
      this.speedModifier *
      (carry === 3 ? 0.75 : carry === 2 ? 0.9 : 1);
    const target = dir * max;
    const acceleration = dir ? 1800 : 2400;
    this.velocity =
      Phaser.Math.Clamp(
        target - this.velocity,
        -acceleration * dt,
        acceleration * dt,
      ) + this.velocity;
    this.x = Phaser.Math.Clamp(this.x + this.velocity * dt, 74, 1365);
    this.moving = Math.abs(this.velocity) > 8;
    if (dir) this.direction = dir;
    this.time += dt;
    const frame = this.moving ? Math.floor(this.time * (run ? 13 : 9)) % 4 : 0;
    this.sprite
      .setPosition(
        this.x,
        568 + (this.moving ? 0 : Math.sin(this.time * 2) * 1),
      )
      .setTexture(`player-${frame}`)
      .setFlipX(this.direction < 0);
  }
}
