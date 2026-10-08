import Phaser from "phaser";
import { button, label, panel } from "./Toolkit";
import { money } from "./HUD";
import type { ServiceScene } from "../scenes/ServiceScene";
import type { DayReport } from "../systems/EconomySystem";
export class SummaryUI {
  active = false;
  private container?: Phaser.GameObjects.Container;
  constructor(private scene: ServiceScene) {}
  private begin() {
    this.close();
    this.active = true;
    const shade = this.scene.add
      .rectangle(720, 425, 1440, 850, 0x102923, 0.83)
      .setInteractive();
    this.container = this.scene.add.container(0, 0, [shade]).setDepth(200);
  }
  private add(...objects: Phaser.GameObjects.GameObject[]) {
    this.container!.add(objects);
  }
  pause() {
    this.begin();
    this.add(
      panel(this.scene, 412, 190, 616, 448, 0xf0e2bd, 1, 15),
      label(
        this.scene,
        720,
        222,
        "MỘT KHOẢNG NGHỈ NHỎ",
        10,
        "#7c8561",
        "bold",
      ).setOrigin(0.5),
      label(
        this.scene,
        720,
        265,
        "Trà vẫn còn ấm.",
        35,
        "#2d4c39",
        "bold",
      ).setOrigin(0.5),
      label(
        this.scene,
        720,
        303,
        "Thời gian và khách đều đang tạm dừng.",
        14,
        "#697957",
      ).setOrigin(0.5),
    );
    const text =
      "A / D hoặc ← →      Di chuyển\nShift                         Chạy nhanh\nE                             Nhận order / tương tác\nGiữ E tại trạm trà       Rót · thả trong vùng xanh\n1–5 tại trạm               Chọn nguyên liệu, đường, đá\nQ                             Bỏ ly đang cầm\nTab                          Xem đơn · Esc tiếp tục";
    this.add(
      label(this.scene, 471, 346, text, 13, "#496247").setLineSpacing(7),
    );
    this.add(
      button(this.scene, 720, 588, 300, 47, "Tiếp tục ca tối  [Esc]", () =>
        this.scene.togglePause(),
      ),
    );
  }
  preparation() {
    this.begin();
    this.add(
      panel(this.scene, 430, 235, 580, 343, 0xf0e2bd, 1, 15),
      label(
        this.scene,
        720,
        270,
        `CHÀO NGÀY ${String(this.scene.saveData.day).padStart(2, "0")}`,
        11,
        "#7c8561",
        "bold",
      ).setOrigin(0.5),
      label(
        this.scene,
        720,
        324,
        "Một tối mới, một cơ hội mới.",
        27,
        "#2d4c39",
        "bold",
      ).setOrigin(0.5),
      label(
        this.scene,
        720,
        382,
        "Đã chuẩn bị 30 phần mỗi nguyên liệu.\nChi phí được tính theo lượng sử dụng cuối ca.\nTrà đã ủ, ly đã xếp. Mình mở cửa thôi!",
        14,
        "#617554",
      )
        .setOrigin(0.5)
        .setAlign("center")
        .setLineSpacing(12),
      button(this.scene, 720, 511, 310, 49, "Mở quán  →  [Enter]", () =>
        this.scene.openShop(),
      ),
    );
  }
  summary(report: DayReport) {
    this.begin();
    const s = this.scene;
    this.add(panel(s, 378, 93, 684, 668, 0xf0e2bd, 1, 16));
    this.add(
      label(
        s,
        720,
        125,
        `HẾT CA · NGÀY ${String(report.day).padStart(2, "0")}`,
        10,
        "#7c8561",
        "bold",
      ).setOrigin(0.5),
      label(
        s,
        720,
        174,
        report.perfect > 0
          ? "Một tối thật ngọt ngào."
          : "Ngày mai mình lại thử nhé.",
        31,
        "#2e4c39",
        "bold",
      ).setOrigin(0.5),
      label(
        s,
        720,
        216,
        `${report.served} khách đã phục vụ   ·   ${report.perfect} ly hoàn hảo   ·   ${report.failed} đơn chưa tốt`,
        12,
        "#657853",
      ).setOrigin(0.5),
    );
    const rows: [string, number][] = [
      ["Doanh thu", report.revenue],
      ["Tiền khách thưởng", report.tips],
      ["Nguyên liệu", -report.ingredients],
      ["Mặt bằng & điện nước", -report.rent - report.utilities],
    ];
    rows.forEach(([title, value], i) => {
      this.add(
        label(s, 421, 268 + i * 42, title, 15, "#607051"),
        label(
          s,
          1019,
          268 + i * 42,
          money(value),
          16,
          "#36513a",
          "bold",
        ).setOrigin(1, 0),
      );
    });
    const line = s.add.rectangle(720, 442, 598, 1, 0x94a078, 0.5);
    this.add(
      line,
      label(s, 421, 466, "LỢI NHUẬN", 11, "#707b55", "bold"),
      label(
        s,
        1019,
        459,
        money(report.profit),
        32,
        "#376e4b",
        "bold",
      ).setOrigin(1, 0),
    );
    this.add(
      label(
        s,
        720,
        520,
        `VÍ TIỆM ${money(s.saveData.money)}     ·     ★ ${report.rating.toFixed(1)}     ·     COMBO TỐT NHẤT ×${s.economy.bestCombo}`,
        11,
        "#617553",
      ).setOrigin(0.5),
    );
    this.add(
      label(
        s,
        421,
        555,
        "MỘT CHÚT NÂNG CẤP CHO NGÀY MAI",
        9,
        "#78835b",
        "bold",
      ),
    );
    const capacity = s.saveData.capacity,
      cost = capacity === 1 ? 80000 : 120000;
    this.add(
      button(
        s,
        567,
        601,
        284,
        45,
        capacity >= 3
          ? "Khay đã tối đa"
          : `Khay ${capacity + 1} ly · ${money(cost)}`,
        () => {
          if (s.buyUpgrade("capacity")) this.summary(report);
        },
      ),
      button(
        s,
        874,
        601,
        283,
        45,
        s.saveData.speedLevel >= 3
          ? "Tốc độ đã tối đa"
          : "Bước chân nhanh · 60.000đ",
        () => {
          if (s.buyUpgrade("speed")) this.summary(report);
        },
      ),
    );
    this.add(
      button(
        s,
        720,
        680,
        598,
        52,
        "Khép ca tối · sang ngày mới  →  [Enter]",
        () => s.nextDay(),
      ),
      label(
        s,
        720,
        731,
        s.saves.warning
          ? "Trình duyệt không cho lưu. Giữ tab này để tiếp tục."
          : "Tiến trình đã lưu trên trình duyệt này.",
        10,
        "#78835b",
      ).setOrigin(0.5),
    );
  }
  close() {
    this.container?.destroy();
    this.container = undefined;
    this.active = false;
  }
}
