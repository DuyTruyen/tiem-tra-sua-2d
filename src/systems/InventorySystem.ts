export type StockKey = "cups" | "tea" | "flavor" | "topping" | "ice";
export class InventorySystem {
  stock: Record<StockKey, number> = {
    cups: 30,
    tea: 30,
    flavor: 30,
    topping: 30,
    ice: 30,
  };
  used = 0;
  consume(key: StockKey) {
    if (this.stock[key] <= 0) return false;
    this.stock[key]--;
    this.used++;
    return true;
  }
  replenish() {
    for (const key of Object.keys(this.stock) as StockKey[])
      this.stock[key] = 30;
  }
}
