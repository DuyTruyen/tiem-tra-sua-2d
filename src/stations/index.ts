import { BaseStation } from "./BaseStation";
import { STATION_X } from "../art/ShopArt";
export class CupStation extends BaseStation {
  constructor(x: number) {
    super("cups", "cup", x, "LY", "Lấy ly · size M");
  }
}
export class TeaStation extends BaseStation {
  constructor(x: number) {
    super("tea", "tea", x, "TRÀ", "Hồng trà / trà xanh", 1.8);
  }
}
export class FlavorStation extends BaseStation {
  constructor(x: number) {
    super("flavor", "flavor", x, "HƯƠNG VỊ", "Sữa · đào · tắc", 0.6);
  }
}
export class ToppingStation extends BaseStation {
  constructor(x: number) {
    super(
      "topping",
      "topping",
      x,
      "TOPPING",
      "Trân châu · thạch · pudding",
      0.5,
    );
  }
}
export class IceStation extends BaseStation {
  constructor(x: number) {
    super("ice", "ice", x, "ĐƯỜNG & ĐÁ", "Pha theo khẩu vị", 0.6);
  }
}
export class SealStation extends BaseStation {
  constructor(x: number) {
    super("seal", "seal", x, "ĐÓNG NẮP", "Chờ máy · 1 giây", 1);
  }
}
export function createStations() {
  return [
    new CupStation(STATION_X[0]),
    new TeaStation(STATION_X[1]),
    new FlavorStation(STATION_X[2]),
    new ToppingStation(STATION_X[3]),
    new IceStation(STATION_X[4]),
    new SealStation(STATION_X[5]),
  ];
}
