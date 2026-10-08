import { RECIPES, type Recipe, type Topping } from "../data/recipes";
import { EventBus } from "../core/EventBus";
import type { DrinkObject } from "../entities/Drink";
export type OrderState =
  | "WAITING_TO_ORDER"
  | "ORDER_TAKEN"
  | "PREPARING"
  | "READY"
  | "SERVING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";
export interface Order {
  id: number;
  customerId: number;
  seat: number;
  recipe: Recipe;
  sugar: number;
  ice: number;
  topping: Topping;
  state: OrderState;
  patience: number;
  maxPatience: number;
}
export class OrderSystem {
  orders: Order[] = [];
  private next = 1;
  constructor(public events = new EventBus()) {}
  create(customerId: number, seat: number, day = 1, first = false): Order {
    const index = first ? 0 : (customerId - 1) % RECIPES.length;
    const topping: Topping = first
      ? "pearl"
      : (["pearl", "jelly", "pudding"] as Topping[])[(customerId - 1) % 3];
    const order: Order = {
      id: this.next++,
      customerId,
      seat,
      recipe: RECIPES[index],
      sugar: first ? 50 : [50, 70, 30][(customerId - 1) % 3],
      ice: first ? 50 : [50, 100, 30][(customerId - 1) % 3],
      topping,
      state: "WAITING_TO_ORDER",
      patience: first ? 150 : 30 + (day === 1 ? 20 : 0),
      maxPatience: first ? 150 : 30 + (day === 1 ? 20 : 0),
    };
    this.orders.push(order);
    this.events.emit("ORDER_CREATED", order);
    return order;
  }
  accept(order: Order, tutorial = false) {
    if (order.state !== "WAITING_TO_ORDER") return false;
    order.state = "ORDER_TAKEN";
    order.maxPatience = tutorial ? 180 : 105;
    order.patience = order.maxPatience;
    this.events.emit("ORDER_ACCEPTED", order);
    return true;
  }
  forCustomer(id: number) {
    return this.orders.find((o) => o.customerId === id);
  }
  get active() {
    return this.orders.filter((o) =>
      ["ORDER_TAKEN", "PREPARING", "READY"].includes(o.state),
    );
  }
  update(dt: number) {
    const failed: Order[] = [];
    for (const o of this.orders) {
      if (
        ["WAITING_TO_ORDER", "ORDER_TAKEN", "PREPARING", "READY"].includes(
          o.state,
        )
      ) {
        o.patience -= dt;
        if (o.patience <= 0) {
          o.patience = 0;
          o.state = "FAILED";
          failed.push(o);
          this.events.emit("CUSTOMER_LEFT", o);
        }
      }
    }
    return failed;
  }
  serve(order: Order, drink: DrinkObject, now: number) {
    if (!this.active.includes(order) || !drink.complete) return null;
    const quality = scoreDrink(order, drink, now);
    order.state = "COMPLETED";
    this.events.emit("CUSTOMER_SERVED", { order, quality });
    return quality;
  }
}
export function scoreDrink(order: Order, drink: DrinkObject, now = 0) {
  if (!drink.complete) return 0;
  let score = drink.quality;
  if (drink.baseTea !== order.recipe.tea) score -= 35;
  if (drink.flavor !== order.recipe.flavor) score -= 45;
  if (drink.topping !== order.topping) score -= 18;
  if (drink.cupSize !== "M") score -= 15;
  score -= Math.min(15, Math.abs((drink.sugar ?? 0) - order.sugar) * 0.3);
  score -= Math.min(15, Math.abs((drink.ice ?? 0) - order.ice) * 0.3);
  score -= Math.min(20, Math.max(0, now - (drink.sealedAt ?? now) - 20) * 0.3);
  return Math.max(0, Math.min(100, Math.round(score)));
}
