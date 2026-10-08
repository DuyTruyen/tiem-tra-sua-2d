import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const executablePath = process.env.CHROMIUM_PATH || "/usr/bin/chromium";
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
const snapshot = () =>
  page.evaluate(() => {
    const s = window.__TEA_GAME__.scene;
    return {
      x: s.player.x,
      phase: s.phase,
      mode: s.stationController.mode,
      drink: s.drinks.current,
      served: s.economy.served,
      perfect: s.economy.perfect,
      wallet: s.economy.money,
      time: s.serviceTime,
      paused: s.paused,
      customers: s.customers.map((c) => ({
        id: c.id,
        seat: c.seat,
        state: c.state,
      })),
      orders: s.orders.orders.map((o) => ({
        id: o.id,
        customerId: o.customerId,
        state: o.state,
        recipe: o.recipe.id,
        sugar: o.sugar,
        ice: o.ice,
      })),
      day: s.saveData.day,
      capacity: s.drinks.capacity,
      fps: s.game.loop.actualFps,
    };
  });
async function moveTo(x) {
  const state = await snapshot();
  if (Math.abs(state.x - x) < 20) return;
  const direction = x > state.x ? 1 : -1,
    key = direction === 1 ? "d" : "a";
  await page.keyboard.down(key);
  await page.waitForFunction(
    ({ x, direction }) => {
      const p = window.__TEA_GAME__.scene.player;
      return direction > 0 ? p.x >= x - 12 : p.x <= x + 12;
    },
    { x, direction },
    { timeout: 45000 },
  );
  await page.keyboard.up(key);
  await page.waitForFunction(
    () => Math.abs(window.__TEA_GAME__.scene.player.velocity) < 1,
  );
  assert.ok(Math.abs((await snapshot()).x - x) < 50, `move to ${x}`);
}
async function key(k) {
  await page.keyboard.press(k, { delay: 65 });
  await page.waitForTimeout(90);
}
async function until(fn) {
  await page.waitForFunction(fn, null, { timeout: 45000 });
}
async function prepare({
  tea = "1",
  flavor = "1",
  topping = "1",
  sugar = "3",
  ice = "3",
}) {
  await moveTo(140);
  await key("e");
  await until(() => !!window.__TEA_GAME__.scene.drinks.current);
  await moveTo(364);
  await page.keyboard.down("e");
  await until(() => window.__TEA_GAME__.scene.stationController.mode === "tea");
  if (tea !== "1") await key(tea);
  await until(
    () => window.__TEA_GAME__.scene.stationController.elapsed >= 1.23,
  );
  await page.keyboard.up("e");
  await until(() => !!window.__TEA_GAME__.scene.drinks.current?.baseTea);
  await moveTo(588);
  await key("e");
  await until(
    () => window.__TEA_GAME__.scene.stationController.mode === "flavor",
  );
  await key(flavor);
  await until(() => !!window.__TEA_GAME__.scene.drinks.current?.flavor);
  await moveTo(812);
  await key("e");
  await until(
    () => window.__TEA_GAME__.scene.stationController.mode === "topping",
  );
  await key(topping);
  await until(
    () =>
      window.__TEA_GAME__.scene.drinks.current?.topping !== null &&
      window.__TEA_GAME__.scene.stationController.mode === null,
  );
  await moveTo(1036);
  await key("e");
  await until(
    () => window.__TEA_GAME__.scene.stationController.mode === "sugar",
  );
  await key(sugar);
  await until(() => window.__TEA_GAME__.scene.stationController.mode === "ice");
  await key(ice);
  await until(
    () =>
      window.__TEA_GAME__.scene.drinks.current?.ice !== null &&
      window.__TEA_GAME__.scene.stationController.mode === null,
  );
  await moveTo(1260);
  await key("e");
  await until(() => !!window.__TEA_GAME__.scene.drinks.current?.sealed);
}
try {
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:5173");
  await until(() => window.__TEA_GAME__?.scene?.hud);
  await mkdir("/tmp/tea-validation", { recursive: true });
  await until(
    () => window.__TEA_GAME__.scene.customers[0]?.state === "WAITING_FOR_ORDER",
  );
  await page.screenshot({ path: "/tmp/tea-validation/gameplay.png" });
  console.log("Game boot and customer entry passed.");
  const pos = (await snapshot()).x;
  await page.keyboard.down("Shift");
  await page.keyboard.down("d");
  await page.waitForTimeout(500);
  await page.keyboard.up("d");
  await page.keyboard.up("Shift");
  assert.ok((await snapshot()).x > pos + 70, "running movement");
  await moveTo(224);
  await key("e");
  await until(() => window.__TEA_GAME__.scene.orders.active.length === 1);
  console.log("Manual order acceptance passed.");
  await key("Escape");
  await page.waitForTimeout(600);
  assert.ok((await snapshot()).paused);
  const frozen = (await snapshot()).time;
  await page.waitForTimeout(300);
  assert.equal((await snapshot()).time, frozen);
  await key("Escape");
  // Cannot pick up a cup remotely; no click or menu can bypass position.
  await key("e");
  assert.equal((await snapshot()).drink, null);
  await prepare({});
  await page.screenshot({ path: "/tmp/tea-validation/ready-cup.png" });
  const wallet = (await snapshot()).wallet;
  await moveTo(224);
  await key("e");
  await until(() => window.__TEA_GAME__.scene.economy.served === 1);
  let state = await snapshot();
  assert.equal(state.perfect, 1);
  assert.ok(state.wallet > wallet);
  assert.equal(state.drink, null);
  assert.equal(state.customers[0].state, "HAPPY");
  console.log(
    "Keyboard-only milk-tea preparation, timing, seal, serve, tip and perfect combo passed.",
  );
  await until(
    () => !window.__TEA_GAME__.scene.customers.some((c) => c.id === 1),
  );
  assert.ok(
    (await snapshot()).customers.length > 0,
    "replacement customer arrived",
  );
  await until(() =>
    window.__TEA_GAME__.scene.customers.some(
      (c) => c.id === 2 && c.state === "WAITING_FOR_ORDER",
    ),
  );
  const seat = await page.evaluate(
    () => window.__TEA_GAME__.scene.customers.find((c) => c.id === 2).seat,
  );
  await moveTo([224, 454, 684, 914, 1144][seat]);
  await key("e");
  await until(() =>
    window.__TEA_GAME__.scene.orders.active.some((o) => o.customerId === 2),
  );
  await prepare({ flavor: "2", topping: "2", sugar: "4", ice: "4" });
  await moveTo([224, 454, 684, 914, 1144][seat]);
  await key("e");
  await until(() => window.__TEA_GAME__.scene.economy.served === 2);
  assert.equal((await snapshot()).perfect, 2);
  console.log(
    "Peach tea with different flavor, topping, sugar and ice passed.",
  );
  await until(() =>
    window.__TEA_GAME__.scene.customers.some(
      (c) => c.id === 3 && c.state === "WAITING_FOR_ORDER",
    ),
  );
  const seat3 = await page.evaluate(
    () => window.__TEA_GAME__.scene.customers.find((c) => c.id === 3).seat,
  );
  await moveTo([224, 454, 684, 914, 1144][seat3]);
  await key("e");
  await until(() =>
    window.__TEA_GAME__.scene.orders.active.some((o) => o.customerId === 3),
  );
  await prepare({ tea: "2", flavor: "3", topping: "3", sugar: "2", ice: "2" });
  await moveTo([224, 454, 684, 914, 1144][seat3]);
  await key("e");
  await until(() => window.__TEA_GAME__.scene.economy.served === 3);
  assert.equal((await snapshot()).perfect, 3);
  console.log("Lime tea using green tea and custom recipe passed.");
  // Existing debug controls accelerate the rest of the actual day.
  await key("F3");
  assert.equal(
    await page.evaluate(() => window.__TEA_GAME__.scene.timeScale),
    12,
  );
  await until(() => window.__TEA_GAME__.scene.phase === "summary");
  state = await snapshot();
  assert.equal(state.day, 1);
  await page.screenshot({ path: "/tmp/tea-validation/summary.png" });
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("tiem-tra-mo.save.v1")),
  );
  assert.equal(saved.day, 2);
  assert.ok(saved.tutorialComplete);
  assert.ok(
    await page.evaluate(() => window.__TEA_GAME__.scene.report.failed > 0),
  );
  console.log("Patience expiry, closing report and saved next day passed.");
  const box = await page.locator("canvas").boundingBox();
  await page.mouse.click(
    box.x + (567 * box.width) / 1440,
    box.y + (601 * box.height) / 850,
  );
  await until(() => window.__TEA_GAME__.scene.saveData.capacity === 2);
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("tiem-tra-mo.save.v1")).capacity,
    ),
    2,
  );
  console.log("Tray upgrade purchase and persistence passed.");
  await key("Enter");
  await until(() => window.__TEA_GAME__?.scene?.phase === "preparation");
  assert.equal((await snapshot()).day, 2);
  assert.equal((await snapshot()).capacity, 2);
  await key("Enter");
  await until(() => window.__TEA_GAME__.scene.phase === "service");
  await page.reload();
  await until(() => window.__TEA_GAME__?.scene?.phase === "preparation");
  assert.equal((await snapshot()).day, 2);
  console.log("Scene restart, preparation and reload persistence passed.");
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).click();
  await page.waitForTimeout(200);
  assert.match(await page.locator("#sound-toggle").textContent(), /bật/);
  assert.ok(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("tiem-tra-mo.save.v1")).audio,
    ),
  );
  console.log("Audio activation and settings persistence passed.");
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(
    "Desktop checks passed. FPS:",
    Math.round((await snapshot()).fps),
  );
  const mobile = await browser.newContext({
    viewport: { width: 844, height: 640 },
    isMobile: true,
    hasTouch: true,
  });
  const touchPage = await mobile.newPage();
  touchPage.on("pageerror", (e) => errors.push(e.message));
  await touchPage.goto(process.env.GAME_URL || "http://127.0.0.1:5173");
  await touchPage.waitForFunction(
    () =>
      window.__TEA_GAME__?.scene?.customers[0]?.state === "WAITING_FOR_ORDER",
  );
  const bounds = await touchPage.locator("canvas").boundingBox();
  const point = (x, y) => ({
    x: bounds.x + (x * bounds.width) / 1440,
    y: bounds.y + (y * bounds.height) / 850,
  });
  const e = point(1323, 678);
  await touchPage.touchscreen.tap(e.x, e.y);
  await touchPage.waitForFunction(
    () => window.__TEA_GAME__.scene.orders.active.length === 1,
  );
  const initialX = await touchPage.evaluate(
    () => window.__TEA_GAME__.scene.player.x,
  );
  const cdp = await mobile.newCDPSession(touchPage);
  const right = point(266, 697);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ ...right, id: 1 }],
  });
  await touchPage.waitForTimeout(600);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  assert.ok(
    await touchPage.evaluate(
      (x) => window.__TEA_GAME__.scene.player.x > x + 75,
      initialX,
    ),
  );
  await touchPage.waitForFunction(
    () => window.__TEA_GAME__.scene.touch.direction === 0,
  );
  await touchPage.screenshot({ path: "/tmp/tea-validation/mobile.png" });
  await mobile.close();
  assert.deepEqual(errors, []);
  console.log(
    "Real touch order acceptance and directional movement passed. All browser checks passed.",
  );
} finally {
  await browser.close();
}
