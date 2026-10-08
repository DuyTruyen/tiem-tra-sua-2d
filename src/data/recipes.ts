export type Tea = "black" | "green";
export type Flavor = "milk" | "peach" | "lime";
export type Topping = "pearl" | "jelly" | "pudding" | "none";
export interface Recipe {
  id: string;
  name: string;
  short: string;
  tea: Tea;
  flavor: Flavor;
  color: number;
  price: number;
  cost: number;
  symbol: string;
}
export const RECIPES: Recipe[] = [
  {
    id: "milk_tea",
    name: "Trà sữa truyền thống",
    short: "Trà sữa",
    tea: "black",
    flavor: "milk",
    color: 0xd7b48c,
    price: 32000,
    cost: 10000,
    symbol: "●",
  },
  {
    id: "peach_tea",
    name: "Trà đào",
    short: "Trà đào",
    tea: "black",
    flavor: "peach",
    color: 0xe4a466,
    price: 28000,
    cost: 9000,
    symbol: "◉",
  },
  {
    id: "lime_tea",
    name: "Trà tắc",
    short: "Trà tắc",
    tea: "green",
    flavor: "lime",
    color: 0xbed18a,
    price: 22000,
    cost: 6000,
    symbol: "✳",
  },
];
export const TEA_NAMES: Record<Tea, string> = {
  black: "Hồng trà",
  green: "Trà xanh",
};
export const FLAVOR_NAMES: Record<Flavor, string> = {
  milk: "Sữa",
  peach: "Siro đào",
  lime: "Nước tắc",
};
export const TOPPING_NAMES: Record<Topping, string> = {
  pearl: "Trân châu",
  jelly: "Thạch",
  pudding: "Pudding",
  none: "Không topping",
};
