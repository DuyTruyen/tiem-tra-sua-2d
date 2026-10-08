import { DrinkObject } from "../entities/Drink";
import type { Tea, Flavor, Topping } from "../data/recipes";
import { InventorySystem } from "./InventorySystem";
import { EventBus } from "../core/EventBus";
export class DrinkSystem {
  hands: DrinkObject[] = [];
  selected = 0;
  nextId = 1;
  capacity = 1;
  constructor(
    public inventory: InventorySystem,
    public events: EventBus,
  ) {}
  get current() {
    return this.hands[this.selected] ?? null;
  }
  pickup(now: number) {
    if (this.hands.length >= this.capacity || !this.inventory.consume("cups"))
      return null;
    const cup = new DrinkObject(this.nextId++, now);
    this.hands.push(cup);
    this.selected = this.hands.length - 1;
    this.events.emit("DRINK_CREATED", cup);
    return cup;
  }
  pour(tea: Tea, timing: number) {
    const d = this.current;
    if (!d || d.baseTea || d.sealed || !this.inventory.consume("tea"))
      return false;
    d.baseTea = tea;
    d.quality =
      timing >= 0.62 && timing <= 0.82
        ? 100
        : timing >= 0.4 && timing <= 0.95
          ? 85
          : 65;
    return true;
  }
  flavor(flavor: Flavor) {
    const d = this.current;
    if (
      !d?.baseTea ||
      d.flavor ||
      d.sealed ||
      !this.inventory.consume("flavor")
    )
      return false;
    d.flavor = flavor;
    return true;
  }
  topping(topping: Topping) {
    const d = this.current;
    if (!d?.flavor || d.topping !== null || d.sealed) return false;
    if (topping !== "none" && !this.inventory.consume("topping")) return false;
    d.topping = topping;
    return true;
  }
  chill(sugar: number, ice: number) {
    const d = this.current;
    if (
      d?.topping === null ||
      !d ||
      d.ice !== null ||
      d.sealed ||
      !this.inventory.consume("ice")
    )
      return false;
    d.sugar = sugar;
    d.ice = ice;
    return true;
  }
  seal(now: number) {
    const d = this.current;
    if (!d || !d.steps.slice(0, 5).every(Boolean) || d.sealed) return false;
    d.sealed = true;
    d.sealedAt = now;
    this.events.emit("DRINK_COMPLETED", d);
    return true;
  }
  remove() {
    const [d] = this.hands.splice(this.selected, 1);
    this.selected = Math.max(0, Math.min(this.selected, this.hands.length - 1));
    return d;
  }
}
