import { test } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../src/core/EventBus";
import { OrderSystem, scoreDrink } from "../src/systems/OrderSystem";
import { DrinkSystem } from "../src/systems/DrinkSystem";
import { InventorySystem } from "../src/systems/InventorySystem";
import { EconomySystem } from "../src/systems/EconomySystem";
import { SaveSystem, freshSave, SAVE_KEY } from "../src/systems/SaveSystem";
function setup() {
  const bus = new EventBus(),
    stock = new InventorySystem(),
    drinks = new DrinkSystem(stock, bus),
    orders = new OrderSystem(bus);
  return { bus, stock, drinks, orders };
}
function complete(drinks: DrinkSystem) {
  drinks.pickup(0);
  drinks.pour("black", 0.7);
  drinks.flavor("milk");
  drinks.topping("pearl");
  drinks.chill(50, 50);
  drinks.seal(12);
  return drinks.current!;
}
test("a cup cannot skip stations or be sealed early", () => {
  const { drinks, stock } = setup();
  assert.equal(drinks.pour("black", 0.7), false);
  assert.equal(drinks.seal(0), false);
  drinks.pickup(0);
  assert.equal(drinks.flavor("milk"), false);
  assert.equal(drinks.topping("pearl"), false);
  assert.equal(drinks.chill(50, 50), false);
  assert.equal(drinks.seal(0), false);
  assert.equal(stock.stock.flavor, 30);
  assert.equal(drinks.current?.complete, false);
});
test("full recipe consumes exactly one serving per station; cannot add twice", () => {
  const { drinks, stock } = setup();
  const d = complete(drinks);
  assert.equal(d.complete, true);
  assert.equal(d.quality, 100);
  assert.deepEqual(stock.stock, {
    cups: 29,
    tea: 29,
    flavor: 29,
    topping: 29,
    ice: 29,
  });
  assert.equal(drinks.pour("green", 0.7), false);
  assert.equal(drinks.seal(20), false);
});
test("full hands and exhausted stock block cup creation", () => {
  const { drinks, stock } = setup();
  assert.ok(drinks.pickup(0));
  assert.equal(drinks.pickup(1), null);
  assert.equal(stock.stock.cups, 29);
  drinks.remove();
  stock.stock.cups = 0;
  assert.equal(drinks.pickup(2), null);
  assert.equal(drinks.current, null);
});
test("capacity upgrade supports three independent cups and selection", () => {
  const { drinks } = setup();
  drinks.capacity = 3;
  for (let i = 0; i < 3; i++) assert.ok(drinks.pickup(i));
  assert.equal(drinks.pickup(4), null);
  drinks.selected = 0;
  assert.ok(drinks.pour("black", 0.7));
  assert.equal(drinks.hands[1].baseTea, null);
  drinks.remove();
  assert.equal(drinks.hands.length, 2);
  assert.equal(drinks.current?.baseTea, null);
});
test("orders only serve accepted customers with completed cups", () => {
  const { drinks, orders } = setup();
  const o = orders.create(1, 0, 1, true);
  const d = complete(drinks);
  assert.equal(orders.serve(o, d, 15), null);
  assert.equal(orders.accept(o, true), true);
  assert.equal(orders.accept(o), false);
  assert.equal(orders.serve(o, d, 15), 100);
  assert.equal(o.state, "COMPLETED");
  assert.equal(orders.serve(o, d, 15), null);
});
test("wrong flavor, tea, sugar and topping reduce quality instead of auto-correcting", () => {
  const { drinks, orders } = setup();
  const o = orders.create(1, 0, 1, true),
    d = complete(drinks);
  d.baseTea = "green";
  d.flavor = "peach";
  d.sugar = 0;
  d.topping = "jelly";
  assert.equal(scoreDrink(o, d, 15), 0);
});
test("underfilled tea and old sealed drinks lose quality", () => {
  const { drinks, orders } = setup();
  const o = orders.create(1, 0, 1, true);
  drinks.pickup(0);
  drinks.pour("black", 0.15);
  drinks.flavor("milk");
  drinks.topping("pearl");
  drinks.chill(50, 50);
  drinks.seal(12);
  assert.equal(scoreDrink(o, drinks.current!, 12), 65);
  assert.equal(scoreDrink(o, drinks.current!, 100), 45);
});
test("patience expires once; completed orders never expire", () => {
  const { drinks, orders } = setup();
  const o = orders.create(1, 0);
  assert.equal(orders.update(60).length, 1);
  assert.equal(o.state, "FAILED");
  assert.equal(orders.update(60).length, 0);
  const o2 = orders.create(4, 1, 1, true);
  orders.accept(o2);
  orders.serve(o2, complete(drinks), 15);
  assert.equal(orders.update(200).length, 0);
});
test("perfect streak raises tip; bad serve breaks combo and reputation", () => {
  const e = new EconomySystem();
  const one = e.reward(32000, 10000, 100),
    two = e.reward(32000, 10000, 100);
  assert.ok(two.tip > one.tip);
  assert.equal(e.combo, 2);
  const rep = e.reputation;
  const bad = e.reward(32000, 10000, 10);
  assert.equal(e.combo, 0);
  assert.equal(bad.payment, 16000);
  assert.equal(bad.tip, 0);
  assert.ok(e.reputation < rep);
  assert.equal(e.failed, 1);
});
test("daily profit and wallet reconcile ingredient, rent and utilities once", () => {
  const e = new EconomySystem(180000);
  const r = e.reward(32000, 10000, 100);
  const report = e.close(1);
  assert.equal(report.profit, r.payment + r.tip - 10000 - 18000 - 6000);
  assert.equal(e.money, 180000 + report.profit);
  assert.equal(report.served, 1);
});
test("save recovers malformed data and persists valid settings", () => {
  const map = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => map.set(k, v),
    },
  });
  const s = new SaveSystem();
  assert.equal(s.load().day, 1);
  map.set(SAVE_KEY, "{bad json");
  assert.equal(s.load().day, 1);
  const save = {
    ...freshSave(),
    day: 3,
    money: 213800,
    capacity: 2,
    audio: true,
  };
  assert.equal(s.save(save), true);
  assert.equal(s.load().day, 3);
  assert.equal(s.load().capacity, 2);
  assert.equal(s.load().audio, true);
  map.set(SAVE_KEY, JSON.stringify({ ...save, money: "oops" }));
  assert.equal(s.load().money, 180000);
});
test("unavailable local storage reports a warning without crashing", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    },
  });
  const s = new SaveSystem();
  assert.equal(s.load().day, 1);
  assert.equal(s.warning, true);
  assert.equal(s.save(freshSave()), false);
});

test("prepaid restocking is charged immediately and is not billed twice at closing", () => {
  const e = new EconomySystem(180000);
  e.spendOnIngredients(12000);
  assert.equal(e.money, 168000);
  const r = e.reward(32000, 10000, 100);
  const report = e.close(1);
  assert.equal(report.ingredients, 22000);
  assert.equal(e.money, 180000 + report.profit);
  assert.equal(report.profit, r.payment + r.tip - 22000 - 24000);
});
