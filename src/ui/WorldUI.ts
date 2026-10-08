import Phaser from "phaser";
import { SEAT_X, type Customer } from "../entities/Customer";
import type { Order } from "../systems/OrderSystem";
import { label, panel } from "./Toolkit";
import { TOPPING_NAMES } from "../data/recipes";
export class CustomerBubble {
  container: Phaser.GameObjects.Container;
  title: Phaser.GameObjects.Text;
  details: Phaser.GameObjects.Text;
  bar: Phaser.GameObjects.Graphics;
  dot: Phaser.GameObjects.Arc;
  constructor(
    scene: Phaser.Scene,
    public customer: Customer,
  ) {
    const bg = panel(scene, -98, -44, 196, 88, 0xf0e2be, 1, 8);
    const triangle = scene.add.triangle(0, 48, 0, 0, 12, 0, 6, 8, 0xf0e2be);
    this.dot = scene.add.circle(-81, -23, 4, 0xd6a665);
    this.title = label(scene, -69, -32, "", 13, "#2e4536", "bold");
    this.details = label(scene, -82, -7, "", 10, "#657155");
    this.bar = scene.add.graphics();
    this.container = scene.add
      .container(SEAT_X[customer.seat], 596, [
        bg,
        triangle,
        this.dot,
        this.title,
        this.details,
        this.bar,
      ])
      .setDepth(60)
      .setVisible(false);
  }
  update(order: Order, near = false) {
    this.container.setVisible(
      ["WAITING_FOR_ORDER", "WAITING_FOR_DRINK"].includes(this.customer.state),
    );
    const waiting = order.state === "WAITING_TO_ORDER";
    this.title.setText(
      waiting
        ? near
          ? "E · Nhận order"
          : "Cho mình gọi món nhé!"
        : near
          ? `${order.recipe.short} · E phục vụ`
          : order.recipe.short,
    );
    this.details.setText(
      waiting
        ? `GHẾ 0${order.seat + 1}  ·  [E] nhận order`
        : `M · Đường ${order.sugar}% · Đá ${order.ice}%\n+ ${TOPPING_NAMES[order.topping]}`,
    );
    this.dot.setFillStyle(waiting ? 0xd6a665 : order.recipe.color);
    const t = order.patience / order.maxPatience;
    this.bar
      .clear()
      .fillStyle(0xc9cfb0)
      .fillRoundedRect(-82, 32, 164, 3, 1)
      .fillStyle(t > 0.5 ? 0x6c9770 : t > 0.25 ? 0xd0a25c : 0xc76d53)
      .fillRoundedRect(-82, 32, 164 * Math.max(0, t), 3, 1);
  }
  destroy() {
    this.container.destroy();
  }
}
