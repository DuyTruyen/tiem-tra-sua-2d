import type { DrinkObject } from "../entities/Drink";
export type StationType = "cup" | "tea" | "flavor" | "topping" | "ice" | "seal";
export class BaseStation {
  interactionRadius = 64;
  level = 1;
  capacity = 40;
  speedModifier = 1;
  constructor(
    public id: string,
    public type: StationType,
    public x: number,
    public name: string,
    public subtitle: string,
    public processingTime = 0,
  ) {}
  get animation() {
    return this.type === "seal" ? "CLAMP → SEAL → POP" : "interact";
  }
  canUse(drink: DrinkObject | null) {
    if (this.type === "cup") return drink === null;
    if (!drink || drink.sealed) return false;
    if (this.type === "tea") return !drink.baseTea;
    if (this.type === "flavor") return !!drink.baseTea && !drink.flavor;
    if (this.type === "topping")
      return !!drink.flavor && drink.topping === null;
    if (this.type === "ice")
      return drink.topping !== null && drink.ice === null;
    return drink.steps.slice(0, 5).every(Boolean);
  }
  prompt(drink: DrinkObject | null) {
    if (this.type === "cup") return "Lấy ly M";
    if (!drink) return "Lấy ly trước nhé";
    if (drink.sealed) return "Mang ly đến đúng khách";
    if (!this.canUse(drink)) return "Hoàn thành bước trước";
    return {
      tea: "Giữ E để rót trà",
      flavor: "Chọn sữa / hương vị",
      topping: "Chọn topping",
      ice: "Chọn đường & đá",
      seal: "Đóng nắp ly",
    }[this.type];
  }
}
