import type { ServiceScene } from "../scenes/ServiceScene";
import type { BaseStation } from "../stations/BaseStation";
import {
  TEA_NAMES,
  type Tea,
  type Flavor,
  type Topping,
} from "../data/recipes";
export class StationController {
  mode: "tea" | "flavor" | "topping" | "sugar" | "ice" | "processing" | null =
    null;
  station: BaseStation | null = null;
  elapsed = 0;
  tea: Tea = "black";
  sugar = 50;
  private operation?: () => boolean;
  private length = 0;
  constructor(private scene: ServiceScene) {}
  start(station: BaseStation) {
    const s = this.scene;
    this.station = station;
    this.elapsed = 0;
    if (station.type === "cup") {
      const cup = s.drinks.pickup(s.serviceTime);
      if (!cup) {
        s.notify("Tay đã đầy hoặc hết ly!");
        return;
      }
      s.audio.play("cup");
      s.effects.float(station.x, 440, "+ Ly M", "#e4e6be");
      s.orderPreparing();
      this.station = null;
      return;
    }
    if (!station.canUse(s.drinks.current)) {
      s.notify(station.prompt(s.drinks.current));
      this.station = null;
      return;
    }
    if (station.type === "tea") {
      this.mode = "tea";
      this.tea = "black";
      this.showTea();
      s.audio.play("pour");
    } else if (station.type === "flavor") {
      this.mode = "flavor";
      s.stationUI.open(
        station,
        "Chọn hương vị",
        ["1  Sữa", "2  Siro đào", "3  Nước tắc"],
        (i) => this.choose(i),
      );
    } else if (station.type === "topping") {
      this.mode = "topping";
      s.stationUI.open(
        station,
        "Thêm topping",
        ["1  Trân châu", "2  Thạch trái cây", "3  Pudding", "4  Không topping"],
        (i) => this.choose(i),
      );
    } else if (station.type === "ice") {
      this.mode = "sugar";
      s.stationUI.open(
        station,
        "Bao nhiêu đường?",
        [
          "1  0% đường",
          "2  30% đường",
          "3  50% đường",
          "4  70% đường",
          "5  100% đường",
        ],
        (i) => this.choose(i),
      );
    } else
      this.process("Máy đang đóng nắp…", () => s.drinks.seal(s.serviceTime));
  }
  private showTea() {
    this.scene.stationUI.open(
      this.station!,
      `Rót ${TEA_NAMES[this.tea].toLowerCase()}`,
      ["1  Hồng trà", "2  Trà xanh"],
      (i) => this.choose(i),
      "Giữ E · thả ở vùng xanh để PERFECT",
    );
  }
  choose(index: number) {
    if (!this.mode || !this.station) return;
    const s = this.scene;
    if (this.mode === "tea" && index < 2) {
      this.tea = index === 0 ? "black" : "green";
      this.showTea();
    } else if (this.mode === "flavor" && index < 3) {
      const v: Flavor = (["milk", "peach", "lime"] as Flavor[])[index];
      this.process("Đang thêm hương vị…", () => s.drinks.flavor(v));
    } else if (this.mode === "topping" && index < 4) {
      const v: Topping = (["pearl", "jelly", "pudding", "none"] as Topping[])[
        index
      ];
      this.process("Đang thêm topping…", () => s.drinks.topping(v));
    } else if (this.mode === "sugar" && index < 5) {
      this.sugar = [0, 30, 50, 70, 100][index];
      this.mode = "ice";
      s.stationUI.open(
        this.station,
        "Bao nhiêu đá?",
        [
          "1  Không đá · 0%",
          "2  Ít đá · 30%",
          "3  Vừa đá · 50%",
          "4  Nhiều đá · 100%",
        ],
        (i) => this.choose(i),
      );
    } else if (this.mode === "ice" && index < 4) {
      const ice = [0, 30, 50, 100][index];
      this.process("Đang thêm đường & đá…", () =>
        s.drinks.chill(this.sugar, ice),
      );
    }
    s.audio.play("select");
  }
  private process(title: string, operation: () => boolean) {
    this.mode = "processing";
    this.elapsed = 0;
    this.length = this.station!.processingTime / this.station!.speedModifier;
    this.operation = operation;
    this.scene.stationUI.open(this.station!, title, []);
  }
  update(dt: number) {
    if (!this.mode || !this.station) return;
    if (
      Math.abs(this.scene.player.x - this.station.x) >
      this.station.interactionRadius
    ) {
      this.cancel();
      this.scene.notify("Đã dừng thao tác vì đi xa trạm.");
      return;
    }
    if (this.mode === "tea") {
      this.elapsed += dt;
      this.scene.stationUI.setProgress(
        this.elapsed / this.station.processingTime,
      );
      if (this.elapsed >= this.station.processingTime * 1.12) this.releaseTea();
    } else if (this.mode === "processing") {
      this.elapsed += dt;
      this.scene.stationUI.setProgress(this.elapsed / this.length, false);
      if (this.elapsed >= this.length) {
        const sealed = this.station.type === "seal";
        const ok = this.operation?.();
        if (ok) {
          this.scene.audio.play(sealed ? "seal" : "cup");
          this.scene.effects.float(
            this.station.x,
            438,
            sealed ? "✓ Sẵn sàng!" : "✓ Đã thêm",
            "#dce8ba",
          );
          if (sealed) this.scene.effects.burst(this.station.x, 410);
        } else
          this.scene.notify("Nguyên liệu đã hết. Tới kho bên phải để bổ sung.");
        this.cancel();
      }
    }
  }
  releaseTea() {
    if (this.mode !== "tea" || !this.station) return;
    if (this.elapsed < 0.12) {
      this.scene.notify("Giữ E để rót, thả phím trong vùng xanh.");
      this.cancel();
      return;
    }
    const timing = this.elapsed / this.station.processingTime;
    const ok = this.scene.drinks.pour(this.tea, timing);
    if (ok)
      this.scene.effects.float(
        this.station.x,
        438,
        timing >= 0.62 && timing <= 0.82
          ? "PERFECT!"
          : timing < 0.4
            ? "Rót hơi ít…"
            : timing > 0.95
              ? "Trà tràn rồi!"
              : "Rót tốt!",
        timing >= 0.62 && timing <= 0.82 ? "#f4d392" : "#d8e2b3",
      );
    else this.scene.notify("Trà đã hết — bổ sung ở kho nhé.");
    this.cancel();
  }
  cancel() {
    this.mode = null;
    this.station = null;
    this.operation = undefined;
    this.scene.stationUI.close();
  }
}
