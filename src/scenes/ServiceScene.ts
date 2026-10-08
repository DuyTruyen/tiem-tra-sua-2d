import Phaser from "phaser";
import { makeShopArt } from "../art/ShopArt";
import { makeCharacterArt } from "../art/CharacterArt";
import { Player } from "../entities/Player";
import { Customer, SEAT_X } from "../entities/Customer";
import { createStations } from "../stations";
import type { BaseStation } from "../stations/BaseStation";
import { EventBus } from "../core/EventBus";
import { OrderSystem, type Order } from "../systems/OrderSystem";
import { InventorySystem } from "../systems/InventorySystem";
import { DrinkSystem } from "../systems/DrinkSystem";
import { EconomySystem, type DayReport } from "../systems/EconomySystem";
import { SaveSystem, type SaveData } from "../systems/SaveSystem";
import { StationController } from "../systems/StationController";
import { AudioSystem } from "../systems/AudioSystem";
import { Ambience } from "../systems/Ambience";
import { HUD, money } from "../ui/HUD";
import { StationUI } from "../ui/StationUI";
import { CustomerBubble } from "../ui/WorldUI";
import { Effects } from "../ui/Effects";
import { SummaryUI } from "../ui/SummaryUI";
import { TouchControls } from "../ui/TouchControls";
import { label, panel } from "../ui/Toolkit";
type Target =
  | { kind: "station"; station: BaseStation; distance: number }
  | { kind: "customer"; customer: Customer; distance: number }
  | { kind: "storage"; distance: number };
export class ServiceScene extends Phaser.Scene {
  saves = new SaveSystem();
  saveData!: SaveData;
  bus!: EventBus;
  orders!: OrderSystem;
  drinks!: DrinkSystem;
  economy!: EconomySystem;
  inventory!: InventorySystem;
  player!: Player;
  stations = createStations();
  customers: Customer[] = [];
  bubbles = new Map<number, CustomerBubble>();
  hud!: HUD;
  stationUI!: StationUI;
  stationController!: StationController;
  effects!: Effects;
  modal!: SummaryUI;
  audio!: AudioSystem;
  ambience!: Ambience;
  touch!: TouchControls;
  keys!: Record<string, Phaser.Input.Keyboard.Key>;
  phase: "preparation" | "service" | "summary" = "service";
  paused = false;
  tutorial = true;
  serviceTime = 0;
  duration = 300;
  timeScale = 1;
  report?: DayReport;
  private nextId = 1;
  private spawnTimer = 0;
  private toast = "";
  private toastUntil = 0;
  private realTime = 0;
  private stepTime = 0;
  private carrySprites: Phaser.GameObjects.Image[] = [];
  private focus!: Phaser.GameObjects.Graphics;
  private worldPrompt!: Phaser.GameObjects.Text;
  private arrow!: Phaser.GameObjects.Text;
  private stationLabels: Phaser.GameObjects.Text[] = [];
  private soundButton?: HTMLElement;
  private soundClick?: () => void;
  constructor() {
    super("ServiceScene");
  }
  init(data: { save?: SaveData } = {}) {
    this.saveData = data.save ?? this.saves.load();
    this.bus = new EventBus();
    this.orders = new OrderSystem(this.bus);
    this.inventory = new InventorySystem();
    this.drinks = new DrinkSystem(this.inventory, this.bus);
    this.drinks.capacity = this.saveData.capacity;
    this.economy = new EconomySystem(
      this.saveData.money,
      this.saveData.reputation,
    );
    this.stations = createStations();
    this.customers = [];
    this.bubbles = new Map();
    this.carrySprites = [];
    this.stationLabels = [];
    this.phase = this.saveData.day === 1 ? "service" : "preparation";
    this.paused = false;
    this.tutorial = !this.saveData.tutorialComplete;
    this.serviceTime = 0;
    this.timeScale = 1;
    this.nextId = 1;
    this.spawnTimer = 0;
    this.realTime = 0;
    this.stepTime = 0;
    this.toastUntil = 0;
    this.report = undefined;
  }
  create() {
    if (!this.textures.exists("shop")) {
      makeShopArt(this);
      makeCharacterArt(this);
    }
    this.add.image(0, 0, "shop").setOrigin(0).setScale(2);
    this.add.image(0, 0, "counter").setOrigin(0).setScale(2).setDepth(30);
    this.ambience = new Ambience(this);
    this.player = new Player(this);
    this.player.speedModifier = 1 + this.saveData.speedLevel * 0.08;
    this.keys = this.input.keyboard!.addKeys(
      "A,D,LEFT,RIGHT,SHIFT,E,SPACE,ESC,TAB,Q,ONE,TWO,THREE,FOUR,FIVE,ENTER,F1,F2,F3,F4,F5",
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture([
      "TAB",
      "SPACE",
      "UP",
      "DOWN",
      "LEFT",
      "RIGHT",
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
    ]);
    this.stations.forEach((station, i) => {
      const bg = panel(
        this,
        station.x - 72,
        454,
        144,
        29,
        0x243f31,
        0.93,
        5,
      ).setDepth(8);
      void bg;
      this.stationLabels.push(
        label(
          this,
          station.x,
          462,
          `${String(i + 1).padStart(2, "0")}  ${station.name}`,
          11,
          "#d5d5ae",
          "bold",
        )
          .setOrigin(0.5, 0)
          .setDepth(9),
      );
    });
    SEAT_X.forEach((x, i) =>
      label(this, x, 777, `GHẾ 0${i + 1}`, 9, "#e6c79a")
        .setOrigin(0.5)
        .setDepth(50),
    );
    panel(this, 1336, 503, 69, 65, 0x354d37, 0.9, 6).setDepth(10);
    label(this, 1370, 516, "KHO", 11, "#d3d0a2", "bold")
      .setOrigin(0.5)
      .setDepth(11);
    label(this, 1370, 540, "[E] +30", 9, "#b4c295").setOrigin(0.5).setDepth(11);
    this.focus = this.add.graphics().setDepth(7);
    this.worldPrompt = label(this, 0, 0, "", 12, "#f4e7c9", "bold")
      .setPadding(9, 6)
      .setBackgroundColor("#294e3d")
      .setOrigin(0.5)
      .setDepth(85);
    this.arrow = label(this, 0, 0, "▼", 20, "#eec288", "bold")
      .setOrigin(0.5)
      .setDepth(12);
    this.stationUI = new StationUI(this);
    this.stationController = new StationController(this);
    this.effects = new Effects(this);
    this.hud = new HUD(this);
    this.modal = new SummaryUI(this);
    this.touch = new TouchControls(this);
    this.audio = new AudioSystem();
    this.audio.enabled = this.saveData.audio;
    this.soundButton = document.getElementById("sound-toggle")!;
    this.updateSoundLabel();
    this.soundClick = () => {
      void this.audio.toggle().then((on) => {
        this.saveData.audio = on;
        this.saves.save({
          ...this.saveData,
          day:
            this.phase === "summary"
              ? this.saveData.day + 1
              : this.saveData.day,
        });
        this.updateSoundLabel();
      });
    };
    this.soundButton.addEventListener("click", this.soundClick);
    this.input.on("pointerdown", () => void this.audio.unlock());
    if (this.phase === "service") this.spawnCustomer();
    else this.modal.preparation();
    const onBlur = () => {
      if (this.phase === "service" && !this.paused) this.togglePause();
    };
    window.addEventListener("blur", onBlur);
    this.events.once("shutdown", () => {
      window.removeEventListener("blur", onBlur);
      if (this.soundClick)
        this.soundButton?.removeEventListener("click", this.soundClick);
      this.audio.dispose();
      this.bus.clear();
    });
    if (import.meta.env.DEV)
      (window as any).__TEA_GAME__ = { scene: this, phase: 10 };
    this.hud.update();
  }
  update(_time: number, delta: number) {
    const dt = Math.min(delta / 1000, 0.1);
    this.realTime += dt;
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      if (this.phase === "service") this.togglePause();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
      if (this.phase === "preparation") this.openShop();
      else if (this.phase === "summary") this.nextDay();
    }
    if (this.paused || this.phase === "summary") return;
    this.ambience.update(dt, this.saveData.day % 3 === 0);
    if (this.phase === "preparation") {
      this.hud.update();
      return;
    }
    const dir =
      this.touch.direction ||
      (this.keys.D.isDown || this.keys.RIGHT.isDown ? 1 : 0) -
        (this.keys.A.isDown || this.keys.LEFT.isDown ? 1 : 0);
    this.player.update(
      dt,
      dir,
      this.keys.SHIFT.isDown || this.touch.run,
      this.drinks.hands.length,
    );
    if (this.player.moving) {
      this.stepTime += dt;
      if (this.stepTime > 0.22) {
        this.audio.play("step");
        this.stepTime = 0;
      }
    }
    const serviceDt = dt * this.timeScale;
    this.serviceTime += serviceDt;
    this.customers.forEach((c) => c.update(serviceDt));
    for (const c of this.customers) {
      if (c.state === "WAITING_FOR_ORDER" && !this.orders.forCustomer(c.id)) {
        const o = this.orders.create(
          c.id,
          c.seat,
          this.saveData.day,
          this.tutorial && c.id === 1,
        );
        o.maxPatience *= c.archetype.patience;
        o.patience = o.maxPatience;
        this.bubbles.set(c.id, new CustomerBubble(this, c));
        this.audio.play("bell");
      }
      if ((c.state === "HAPPY" || c.state === "ANGRY") && c.wait > 2.5) {
        c.state = "LEAVING";
        c.drink?.setVisible(false);
      }
    }
    this.orders.update(serviceDt).forEach((o) => {
      const c = this.customers.find((c) => c.id === o.customerId);
      if (c) {
        c.state = "ANGRY";
        c.wait = 0;
        this.effects.float(c.x, 635, "Mình phải đi rồi…", "#e3a689");
      }
      this.economy.lost();
      this.audio.play("bad");
      if (this.tutorial) {
        this.tutorial = false;
        this.saveData.tutorialComplete = true;
      }
    });
    for (const c of [...this.customers])
      if (c.state === "LEAVING" && c.x > 1520) {
        this.bubbles.get(c.id)?.destroy();
        this.bubbles.delete(c.id);
        c.destroy();
        this.customers = this.customers.filter((other) => other !== c);
      }
    if (this.serviceTime < this.duration && !this.tutorial) {
      this.spawnTimer += serviceDt;
      const limit = Math.min(5, 2 + Math.floor((this.saveData.day - 1) / 2));
      const interval =
        this.serviceTime > 120 && this.serviceTime < 220 ? 13 : 22;
      if (this.customers.length === 0 || this.spawnTimer >= interval) {
        if (this.customers.length < limit) this.spawnCustomer();
        this.spawnTimer = 0;
      }
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.keys.E) ||
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE)
    )
      this.interact();
    if (
      Phaser.Input.Keyboard.JustUp(this.keys.E) ||
      Phaser.Input.Keyboard.JustUp(this.keys.SPACE)
    )
      this.stationController.releaseTea();
    ["ONE", "TWO", "THREE", "FOUR", "FIVE"].forEach((name, i) => {
      if (Phaser.Input.Keyboard.JustDown(this.keys[name])) {
        if (this.stationController.mode) this.stationController.choose(i);
        else if (i < this.drinks.hands.length) this.drinks.selected = i;
      }
    });
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
      if (this.drinks.current) {
        this.stationController.cancel();
        this.drinks.remove();
        this.economy.ingredients += 2000;
        this.notify("Đã bỏ ly. Lấy ly mới để pha lại.");
      }
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.TAB))
      this.hud.expanded = !this.hud.expanded;
    this.stationController.update(dt);
    this.drawCarry();
    this.drawFocus();
    this.bubbles.forEach((b) => {
      const o = this.orders.forCustomer(b.customer.id);
      if (o) b.update(o, Math.abs(this.player.x - b.customer.x) < 64);
    });
    this.hud.update();
    this.debugInput();
    if (this.serviceTime >= this.duration && this.phase === "service")
      this.closeDay();
  }
  interact() {
    if (this.paused || this.phase !== "service") return;
    void this.audio.unlock();
    if (this.stationController.mode) {
      if (this.stationController.mode !== "tea")
        this.stationController.cancel();
      return;
    }
    const target = this.target();
    if (!target) {
      this.notify("Chạy đến gần một trạm hoặc ghế khách nhé.");
      return;
    }
    if (target.kind === "storage") {
      const cost = 12000;
      if (this.economy.money < cost) {
        this.notify("Cần 12.000đ để bổ sung nguyên liệu.");
        return;
      }
      this.economy.spendOnIngredients(cost);
      this.inventory.replenish();
      this.notify("Kho đã bổ sung 30 phần mỗi loại · −12.000đ.");
      this.audio.play("cup");
    } else if (target.kind === "station")
      this.stationController.start(target.station);
    else {
      const c = target.customer,
        o = this.orders.forCustomer(c.id);
      if (!o) return;
      if (c.state === "WAITING_FOR_ORDER") {
        if (this.orders.accept(o, this.tutorial)) {
          c.state = "WAITING_FOR_DRINK";
          this.notify(
            `GHẾ 0${c.seat + 1}: ${o.recipe.name} · ${o.sugar}% đường · ${o.ice}% đá`,
          );
          this.audio.play("select");
        }
      } else if (c.state === "WAITING_FOR_DRINK") this.serve(c, o);
    }
  }
  target(): Target | null {
    const targets: Target[] = this.stations.map((station) => ({
      kind: "station" as const,
      station,
      distance: Math.abs(station.x - this.player.x),
    }));
    for (const c of this.customers)
      if (["WAITING_FOR_ORDER", "WAITING_FOR_DRINK"].includes(c.state))
        targets.push({
          kind: "customer",
          customer: c,
          distance: Math.abs(c.x - this.player.x),
        });
    targets.push({ kind: "storage", distance: Math.abs(1370 - this.player.x) });
    return (
      targets
        .filter((t) => t.distance <= 64)
        .sort((a, b) => a.distance - b.distance)[0] ?? null
    );
  }
  serve(c: Customer, o: Order) {
    const d = this.drinks.current;
    if (!d?.complete) {
      this.notify(
        d
          ? "Pha đủ nguyên liệu và đóng nắp trước nhé."
          : "Bạn chưa cầm ly nào. Tới trạm LY để bắt đầu.",
      );
      return;
    }
    const quality = this.orders.serve(o, d, this.serviceTime);
    if (quality === null) return;
    const reward = this.economy.reward(
      o.recipe.price,
      o.recipe.cost,
      quality,
      c.archetype.tip,
    );
    this.bus.emit("MONEY_GAINED", reward);
    this.drinks.remove();
    c.state = quality >= 50 ? "HAPPY" : "ANGRY";
    c.wait = 0;
    c.drink = this.add
      .image(c.x + 29, 680, "cup")
      .setScale(1.25)
      .setDepth(45)
      .setTint(o.recipe.color);
    this.effects.float(
      c.x,
      585,
      quality >= 90
        ? "♥ Ngon quá!"
        : quality >= 75
          ? "Cảm ơn nhé!"
          : quality >= 50
            ? "Cũng ổn đó!"
            : "Mình đâu gọi món này!",
      quality >= 50 ? "#eee6b8" : "#e6a286",
    );
    this.effects.float(c.x, 535, `+${money(reward.payment + reward.tip)}`);
    this.audio.play(quality >= 50 ? "coin" : "bad");
    if (quality >= 90) {
      this.effects.burst(c.x, 625);
      this.cameras.main.shake(110, 0.0015);
      this.tweens.add({
        targets: c.sprite,
        scaleX: 1.95,
        scaleY: 1.95,
        duration: 140,
        yoyo: true,
      });
    }
    if (this.tutorial) {
      this.tutorial = false;
      this.saveData.tutorialComplete = true;
      this.spawnTimer = 18;
      this.notify(
        "Ly đầu tiên đã xong! Khách mới sắp ghé — mình tiếp tục nhé.",
      );
    }
  }
  spawnCustomer() {
    if (this.customers.length >= 5 || this.serviceTime >= this.duration) return;
    const seat = SEAT_X.findIndex(
      (_, i) => !this.customers.some((c) => c.seat === i),
    );
    if (seat < 0) return;
    this.customers.push(new Customer(this, this.nextId++, seat));
  }
  orderPreparing() {
    const o = this.orders.active.find((o) => o.state === "ORDER_TAKEN");
    if (o) o.state = "PREPARING";
  }
  notify(message: string) {
    this.toast = message;
    this.toastUntil = this.realTime + 4;
  }
  contextHint() {
    if (this.toastUntil > this.realTime) return this.toast;
    if (this.stationController.mode === "tea")
      return "Giữ E để rót · thả trong vùng xanh · 1 Hồng trà / 2 Trà xanh";
    if (this.stationController.mode)
      return "Chọn bằng phím số hoặc chạm vào nguyên liệu · di chuyển xa để hủy";
    const t = this.target();
    if (t?.kind === "station")
      return `[E] ${t.station.prompt(this.drinks.current)}  ·  ${t.station.subtitle}`;
    if (t?.kind === "customer")
      return `[E] ${t.customer.state === "WAITING_FOR_ORDER" ? "Nhận order" : "Phục vụ ly trên tay"}  ·  ${t.customer.archetype.name}`;
    if (t?.kind === "storage") return "[E] Bổ sung 30 phần mỗi loại · 12.000đ";
    return this.drinks.current?.sealed
      ? "Ly đã sẵn sàng — chạy tới đúng ghế khách và nhấn E."
      : "A / D để di chuyển · Shift chạy · E tương tác ở trạm hoặc ghế khách.";
  }
  tutorialText() {
    if (this.phase === "preparation")
      return "Trà đã ủ, nguyên liệu đã sẵn. Mở cửa cho một tối mới!";
    if (!this.tutorial)
      return this.serviceTime > 120 && this.serviceTime < 220
        ? "Giờ cao điểm! Ưu tiên khách đang chờ lâu nhất."
        : this.orders.active.length
          ? "Khách đang đợi. Pha đúng vị, phục vụ đúng người."
          : "Hít thở một chút. Khách mới sắp ghé rồi.";
    const o = this.orders.orders[0],
      d = this.drinks.current;
    if (!o || o.state === "WAITING_TO_ORDER")
      return "01 / Chạy đến GHẾ 01. Nhấn E để nhận order đầu tiên.";
    if (!d) return "02 / Tới trạm LY bên trái. Nhấn E để lấy một ly M.";
    if (!d.baseTea)
      return "03 / Tới TRÀ. Giữ E, thả phím khi thanh chạm vùng xanh.";
    if (!d.flavor) return "04 / Tới HƯƠNG VỊ. Nhấn E, chọn 1 để thêm sữa.";
    if (d.topping === null)
      return "05 / Tới TOPPING. Nhấn E, chọn 1 để thêm trân châu.";
    if (d.ice === null)
      return "06 / Tới ĐƯỜNG & ĐÁ. Chọn 3 hai lần: 50% đường, 50% đá.";
    if (!d.sealed) return "07 / Tới ĐÓNG NẮP. Nhấn E và chờ máy hoàn tất.";
    return "08 / Mang ly về GHẾ 01. Nhấn E để phục vụ!";
  }
  private drawCarry() {
    while (this.carrySprites.length < this.drinks.hands.length)
      this.carrySprites.push(
        this.add.image(0, 0, "cup").setScale(1.15).setDepth(25),
      );
    this.carrySprites.forEach((sprite, i) => {
      const d = this.drinks.hands[i];
      sprite.setVisible(!!d);
      if (d) {
        sprite
          .setPosition(
            this.player.x + this.player.direction * (27 + i * 19),
            521 +
              Math.sin(this.realTime * 8) * (this.player.moving ? 1.5 : 0.3),
          )
          .setAlpha(i === this.drinks.selected ? 1 : 0.65)
          .setTint(
            d.flavor === "peach"
              ? 0xf1bd7c
              : d.flavor === "lime"
                ? 0xc9de9d
                : 0xffffff,
          );
      }
    });
  }
  private drawFocus() {
    const t = this.target();
    this.focus.clear();
    this.worldPrompt.setVisible(
      !!t && t.kind !== "customer" && !this.stationController.mode,
    );
    this.stationLabels.forEach((l, i) =>
      l.setColor(
        t?.kind === "station" && t.station === this.stations[i]
          ? "#f6df9e"
          : "#d5d5ae",
      ),
    );
    if (t && !this.stationController.mode) {
      const x =
        t.kind === "station"
          ? t.station.x
          : t.kind === "customer"
            ? t.customer.x
            : 1370;
      this.worldPrompt
        .setPosition(
          Phaser.Math.Clamp(x, 100, 1340),
          t.kind === "station" ? 323 : 490,
        )
        .setText(
          t.kind === "station"
            ? `E · ${t.station.type === "cup" ? "Lấy ly" : t.station.name.toLowerCase()}`
            : t.kind === "customer"
              ? `E · ${t.customer.state === "WAITING_FOR_ORDER" ? "Nhận order" : "Phục vụ"}`
              : "E · Bổ sung",
        );
      if (t.kind === "station")
        this.focus
          .lineStyle(2, 0xd6c883, 0.65)
          .strokeRoundedRect(x - 63, 337, 126, 112, 8);
    }
    this.arrow.setVisible(
      this.tutorial && !this.stationController.mode && t?.kind !== "station",
    );
    if (this.tutorial) {
      const d = this.drinks.current,
        o = this.orders.orders[0];
      let x = 224;
      if (o && o.state !== "WAITING_TO_ORDER") {
        x = !d
          ? 140
          : !d.baseTea
            ? 364
            : !d.flavor
              ? 588
              : d.topping === null
                ? 812
                : d.ice === null
                  ? 1036
                  : !d.sealed
                    ? 1260
                    : 224;
      }
      this.arrow.setPosition(x, 316 + Math.sin(this.realTime * 4) * 5);
    }
  }
  togglePause() {
    if (this.phase !== "service") return;
    this.paused = !this.paused;
    if (this.paused) {
      this.stationController.cancel();
      this.player.velocity = 0;
      this.touch.direction = 0;
      this.modal.pause();
    } else {
      this.modal.close();
      this.input.keyboard?.resetKeys();
    }
  }
  openShop() {
    if (this.phase !== "preparation") return;
    this.phase = "service";
    this.modal.close();
    this.spawnCustomer();
    this.input.keyboard?.resetKeys();
  }
  closeDay() {
    if (this.phase !== "service") return;
    this.stationController.cancel();
    for (const o of this.orders.active) {
      o.state = "CANCELLED";
      this.economy.lost();
    }
    for (const o of this.orders.orders)
      if (o.state === "WAITING_TO_ORDER") {
        o.state = "CANCELLED";
        this.economy.lost();
      }
    this.report = this.economy.close(this.saveData.day);
    this.phase = "summary";
    this.saveData.money = this.economy.money;
    this.saveData.reputation = this.economy.reputation;
    this.saveData.bestCombo = Math.max(
      this.saveData.bestCombo,
      this.economy.bestCombo,
    );
    this.saves.save({ ...this.saveData, day: this.saveData.day + 1 });
    this.hud.update();
    this.modal.summary(this.report);
  }
  buyUpgrade(type: "capacity" | "speed") {
    if (this.phase !== "summary") return false;
    const max =
      type === "capacity"
        ? this.saveData.capacity >= 3
        : this.saveData.speedLevel >= 3;
    if (max) {
      this.notify("Đã nâng cấp tối đa.");
      return false;
    }
    const cost =
      type === "capacity"
        ? this.saveData.capacity === 1
          ? 80000
          : 120000
        : 60000;
    if (this.saveData.money < cost) {
      this.effects.float(720, 550, "Ví tiệm chưa đủ tiền.", "#995f42");
      return false;
    }
    this.saveData.money -= cost;
    if (type === "capacity") this.saveData.capacity++;
    else this.saveData.speedLevel++;
    this.economy.money = this.saveData.money;
    this.saves.save({ ...this.saveData, day: this.saveData.day + 1 });
    this.audio.play("coin");
    return true;
  }
  nextDay() {
    if (this.phase !== "summary") return;
    const save = { ...this.saveData, day: this.saveData.day + 1 };
    this.scene.restart({ save });
  }
  private updateSoundLabel() {
    if (this.soundButton) {
      this.soundButton.innerHTML = `♫ <span>Âm thanh: ${this.audio.enabled ? "bật" : "tắt"}</span>`;
      this.soundButton.setAttribute(
        "aria-label",
        this.audio.enabled ? "Tắt âm thanh" : "Bật âm thanh",
      );
    }
  }
  private debugInput() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.F1)) {
      this.spawnCustomer();
      this.hud.debug.setVisible(true);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.F2)) {
      this.economy.money += 100000;
      this.hud.debug.setVisible(true);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.F3)) {
      this.timeScale = this.timeScale === 1 ? 12 : 1;
      this.hud.debug.setVisible(true);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.F4)) {
      for (const o of this.orders.orders)
        if (
          ["WAITING_TO_ORDER", "ORDER_TAKEN", "PREPARING", "READY"].includes(
            o.state,
          )
        )
          o.state = "CANCELLED";
      for (const c of this.customers) {
        this.bubbles.get(c.id)?.destroy();
        c.destroy();
      }
      this.customers = [];
      this.bubbles.clear();
      this.tutorial = false;
      this.hud.debug.setVisible(true);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.F5)) {
      this.inventory.replenish();
      this.hud.debug.setVisible(true);
    }
  }
}
