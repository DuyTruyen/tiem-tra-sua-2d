import Phaser from "phaser";
import { label, panel, button } from "./Toolkit";
import type { ServiceScene } from "../scenes/ServiceScene";
import { TOPPING_NAMES, TEA_NAMES, FLAVOR_NAMES } from "../data/recipes";
export function money(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}
export class HUD {
  wallet: Phaser.GameObjects.Text;
  rating: Phaser.GameObjects.Text;
  clock: Phaser.GameObjects.Text;
  day: Phaser.GameObjects.Text;
  status: Phaser.GameObjects.Text;
  goal: Phaser.GameObjects.Text;
  hint: Phaser.GameObjects.Text;
  orders: Phaser.GameObjects.Text;
  orderTitle: Phaser.GameObjects.Text;
  drinkText: Phaser.GameObjects.Text;
  progress: Phaser.GameObjects.Graphics;
  combo: Phaser.GameObjects.Text;
  stock: Phaser.GameObjects.Text;
  orderContainer: Phaser.GameObjects.Container;
  steps: Phaser.GameObjects.Graphics;
  debug: Phaser.GameObjects.Text;
  expanded = false;
  constructor(private scene: ServiceScene) {
    const shade = scene.add
      .rectangle(0, 0, 1440, 116, 0x132e2c, 0.97)
      .setOrigin(0)
      .setDepth(90);
    scene.add
      .rectangle(0, 114, 1440, 2, 0xb79c67, 0.3)
      .setOrigin(0)
      .setDepth(100);
    panel(scene, 28, 20, 245, 78);
    label(scene, 80, 33, "VÍ CỦA TIỆM", 9, "#a9bb99", "bold");
    scene.add.circle(54, 60, 13, 0xe9bd79).setDepth(100);
    label(scene, 54, 59, "₫", 18, "#415541", "bold").setOrigin(0.5);
    this.wallet = label(scene, 80, 53, "", 25, "#f5e2bc", "bold");
    panel(scene, 283, 20, 147, 78);
    label(scene, 303, 32, "KHÁCH THƯƠNG", 9, "#a9bb99", "bold");
    this.rating = label(scene, 303, 53, "", 22, "#edc488", "bold");
    panel(scene, 527, 20, 367, 78);
    label(scene, 549, 33, "GIỜ SÀI GÒN", 9, "#a9bb99", "bold");
    this.clock = label(scene, 549, 49, "17:00", 28, "#f4e5c8", "bold");
    this.status = label(
      scene,
      866,
      42,
      "● ĐANG MỞ CỬA",
      11,
      "#b9ce9c",
    ).setOrigin(1, 0);
    this.progress = scene.add.graphics().setDepth(100);
    label(scene, 962, 37, "HẺM 28 / PHỐ NHỎ", 9, "#a9bb99");
    this.day = label(scene, 962, 56, "", 19, "#ebd6ad", "bold");
    this.combo = label(scene, 1132, 65, "", 14, "#f0c482").setOrigin(0.5);
    button(scene, 1316, 59, 183, 45, "Ⅱ  Tạm dừng", () => scene.togglePause());
    const task = panel(scene, 30, 137, 284, 112, 0x233e34, 0.95);
    label(scene, 49, 152, "SỔ TAY NGƯỜI CHỦ TIỆM", 9, "#d4ba88", "bold");
    this.goal = label(
      scene,
      49,
      178,
      "",
      14,
      "#f0e1bd",
      "bold",
    ).setWordWrapWidth(246);
    label(scene, 49, 225, "Mỗi chiếc ly, một chút thương.", 10, "#a7b992");
    const orderBg = panel(scene, 1108, 137, 302, 167, 0xf0e2bd, 0.98);
    this.orderTitle = label(
      scene,
      1130,
      154,
      "ĐƠN ĐANG CHỜ",
      10,
      "#687454",
      "bold",
    );
    this.orders = label(scene, 1130, 180, "", 12, "#324b38")
      .setLineSpacing(7)
      .setWordWrapWidth(257);
    this.orderContainer = scene.add
      .container(0, 0, [orderBg, this.orderTitle, this.orders])
      .setDepth(100);
    panel(scene, 30, 800, 1380, 36, 0x172f2a, 0.95, 6);
    this.hint = label(scene, 49, 809, "", 12, "#dbdbb7");
    label(
      scene,
      1389,
      809,
      "Q  Bỏ ly  ·  1/2/3  Đổi tay",
      10,
      "#a6b495",
    ).setOrigin(1, 0);
    const drinkBg = panel(scene, 1010, 725, 400, 58, 0x1d392f, 0.97);
    this.drinkText = label(
      scene,
      1030,
      737,
      "TAY TRỐNG",
      10,
      "#bdc9a4",
      "bold",
    );
    this.steps = scene.add.graphics().setDepth(100);
    this.stock = label(scene, 30, 764, "", 10, "#dfccaa");
    this.debug = label(scene, 35, 310, "", 12, "#fff8c6")
      .setBackgroundColor("#172b28")
      .setPadding(8)
      .setDepth(160)
      .setVisible(false);
    // Keep referenced objects owned by scene even when no explicit field is needed.
    void shade;
    void task;
    void drinkBg;
  }
  update() {
    const s = this.scene;
    this.wallet.setText(money(s.economy.money));
    this.rating.setText(`★ ${s.economy.reputation.toFixed(1)} / 5`);
    this.day.setText(
      `CA TỐI · NGÀY ${String(s.saveData.day).padStart(2, "0")}`,
    );
    const minutes =
      17 * 60 + Math.min(300, Math.floor((s.serviceTime / s.duration) * 300));
    this.clock.setText(
      `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`,
    );
    this.status.setText(
      s.phase === "preparation"
        ? "○ ĐANG CHUẨN BỊ"
        : s.serviceTime >= s.duration
          ? "○ ĐANG ĐÓNG QUÁN"
          : "● ĐANG MỞ CỬA",
    );
    this.progress
      .clear()
      .fillStyle(0x51634b)
      .fillRect(650, 80, 216, 3)
      .fillStyle(0xc9b982)
      .fillRect(650, 80, 216 * Math.min(1, s.serviceTime / s.duration), 3);
    this.combo.setText(
      s.economy.combo > 1 ? `✦ COMBO ×${s.economy.combo}` : "",
    );
    this.goal.setText(s.tutorialText());
    this.hint.setText(s.contextHint());
    this.stock.setText(
      `NGUYÊN LIỆU  ·  Ly ${s.inventory.stock.cups}   Trà ${s.inventory.stock.tea}   Vị ${s.inventory.stock.flavor}   Topping ${s.inventory.stock.topping}   Đá ${s.inventory.stock.ice}`,
    );
    const orders = s.orders.active.slice(0, 3);
    this.orderTitle.setText(
      `ĐƠN ĐANG CHỜ   ${s.orders.active.length ? `0${s.orders.active.length}` : "—"}`,
    );
    this.orders.setText(
      orders.length
        ? orders
            .map(
              (o) =>
                `GHẾ 0${o.seat + 1}   ${o.recipe.short}  ·  M\n${o.sugar}% đường · ${o.ice}% đá · ${TOPPING_NAMES[o.topping]}${this.expanded ? `\n${Math.ceil(o.patience)} giây còn lại` : ""}`,
            )
            .join("\n")
        : "Chạy đến ghế có khách,\nnhấn E để nhận order.\n\nMột ca tối thật ngon nhé!",
    );
    this.orderContainer.setAlpha(orders.length ? 1 : 0.92);
    const d = s.drinks.current;
    this.drinkText.setText(
      d
        ? `${d.sealed ? "✓ SẴN SÀNG PHỤC VỤ" : "LY ĐANG PHA"}  ·  ${s.drinks.selected + 1}/${s.drinks.capacity}  ·  ${d.flavor ? FLAVOR_NAMES[d.flavor] : d.baseTea ? TEA_NAMES[d.baseTea] : "Ly M"}`
        : `TAY TRỐNG  ·  ${s.drinks.hands.length}/${s.drinks.capacity} LY`,
    );
    this.steps.clear();
    const names = ["LY", "TRÀ", "VỊ", "TOP", "ĐÁ", "NẮP"];
    for (let i = 0; i < 6; i++) {
      this.steps
        .fillStyle(d?.steps[i] ? 0xafc996 : 0x485b43)
        .fillRoundedRect(1030 + i * 59, 761, 49, 4, 2);
    }
    void names;
    if (this.debug.visible)
      this.debug.setText(
        `FPS ${Math.round(s.game.loop.actualFps)}\nKhách ${s.customers.length} · ${s.orders.active.length} order\n${s.stations.map((st) => `${st.type}: ${st.canUse(d) ? "READY" : "WAIT"}`).join(" | ")}\nTốc độ thời gian ×${s.timeScale}\nF1 khách · F2 tiền · F3 nhanh · F4 dọn quán · F5 nguyên liệu`,
      );
  }
}
