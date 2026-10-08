export interface DayReport {
  day: number;
  revenue: number;
  tips: number;
  ingredients: number;
  rent: number;
  utilities: number;
  profit: number;
  served: number;
  perfect: number;
  failed: number;
  rating: number;
}
export class EconomySystem {
  revenue = 0;
  tips = 0;
  ingredients = 0;
  served = 0;
  perfect = 0;
  failed = 0;
  combo = 0;
  bestCombo = 0;
  private prepaid = 0;
  constructor(
    public money = 180000,
    public reputation = 4.2,
  ) {}
  reward(price: number, cost: number, quality: number, tipMultiplier = 1) {
    this.served++;
    this.ingredients += cost;
    const payment = quality < 50 ? Math.round(price * 0.5) : price;
    if (quality >= 90) {
      this.perfect++;
      this.combo++;
      this.reputation = Math.min(5, this.reputation + 0.025);
    } else {
      this.combo = 0;
      if (quality < 50) {
        this.failed++;
        this.reputation = Math.max(1, this.reputation - 0.08);
      }
    }
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const tip =
      quality >= 75
        ? Math.round(
            (price *
              (quality >= 90 ? 0.12 : 0.05) *
              (1 + Math.min(4, this.combo - 1) * 0.15) *
              tipMultiplier) /
              100,
          ) * 100
        : 0;
    this.revenue += payment;
    this.tips += tip;
    this.money += payment + tip;
    return { payment, tip, quality, combo: this.combo };
  }
  spendOnIngredients(amount: number) {
    this.money -= amount;
    this.ingredients += amount;
    this.prepaid += amount;
  }
  lost() {
    this.failed++;
    this.combo = 0;
    this.reputation = Math.max(1, this.reputation - 0.05);
  }
  close(day: number): DayReport {
    const rent = 18000,
      utilities = 6000;
    const profit =
      this.revenue + this.tips - this.ingredients - rent - utilities;
    this.money -= this.ingredients - this.prepaid + rent + utilities;
    return {
      day,
      revenue: this.revenue,
      tips: this.tips,
      ingredients: this.ingredients,
      rent,
      utilities,
      profit,
      served: this.served,
      perfect: this.perfect,
      failed: this.failed,
      rating: this.reputation,
    };
  }
}
