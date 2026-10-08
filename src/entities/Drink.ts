import type { Tea, Flavor, Topping } from "../data/recipes";
export class DrinkObject {
  cupSize = "M";
  baseTea: Tea | null = null;
  flavor: Flavor | null = null;
  topping: Topping | null = null;
  sugar: number | null = null;
  ice: number | null = null;
  sealed = false;
  quality = 100;
  freshness = 100;
  temperature = 5;
  ownerOrderId: number | null = null;
  createdAt: number;
  sealedAt: number | null = null;
  constructor(
    public id: number,
    now = 0,
  ) {
    this.createdAt = now;
  }
  get steps() {
    return [
      true,
      !!this.baseTea,
      !!this.flavor,
      this.topping !== null,
      this.ice !== null && this.sugar !== null,
      this.sealed,
    ];
  }
  get complete() {
    return this.steps.every(Boolean);
  }
}
