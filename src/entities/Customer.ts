import Phaser from "phaser";
export const SEAT_X = [224, 454, 684, 914, 1144];
export const ARCHETYPES = [
  { id: "student", name: "Minh · sinh viên", patience: 1.15, tip: 1 },
  { id: "office", name: "An · văn phòng", patience: 0.9, tip: 1.25 },
  { id: "shipper", name: "Tú · shipper", patience: 0.95, tip: 1.1 },
  { id: "neighbor", name: "Cô Hạnh · hàng xóm", patience: 1.3, tip: 0.9 },
  { id: "artist", name: "Vy · họa sĩ", patience: 1.1, tip: 1.2 },
];
export type CustomerState =
  | "ENTERING"
  | "WAITING_FOR_ORDER"
  | "WAITING_FOR_DRINK"
  | "DRINKING"
  | "HAPPY"
  | "ANGRY"
  | "LEAVING";
export class Customer {
  sprite: Phaser.GameObjects.Image;
  state: CustomerState = "ENTERING";
  x = 1470;
  wait = 0;
  elapsed = 0;
  drink?: Phaser.GameObjects.Image;
  constructor(
    private scene: Phaser.Scene,
    public id: number,
    public seat: number,
    public archetype = ARCHETYPES[id % ARCHETYPES.length],
  ) {
    this.sprite = scene.add
      .image(this.x, 746, `${archetype.id}-0`)
      .setOrigin(0.5, 1)
      .setScale(1.8)
      .setDepth(40);
  }
  update(dt: number) {
    this.elapsed += dt;
    if (this.state === "ENTERING") {
      this.x = Math.max(SEAT_X[this.seat], this.x - 280 * dt);
      this.sprite
        .setTexture(`${this.archetype.id}-${Math.floor(this.elapsed * 8) % 4}`)
        .setFlipX(true);
      if (this.x === SEAT_X[this.seat]) {
        this.state = "WAITING_FOR_ORDER";
        this.sprite.setTexture(`${this.archetype.id}-0`).setFlipX(false);
      }
    } else if (this.state === "LEAVING") {
      this.x += 300 * dt;
      this.sprite
        .setFlipX(false)
        .setTexture(`${this.archetype.id}-${Math.floor(this.elapsed * 8) % 4}`);
    } else {
      this.sprite.y = 746 + Math.sin(this.elapsed * 2) * 0.8;
      this.wait += dt;
    }
    this.sprite.x = this.x;
    this.drink?.setPosition(this.x + 29, 680);
  }
  destroy() {
    this.sprite.destroy();
    this.drink?.destroy();
  }
}
