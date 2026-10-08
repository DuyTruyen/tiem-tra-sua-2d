export interface SaveData {
  version: 1;
  day: number;
  money: number;
  reputation: number;
  capacity: number;
  speedLevel: number;
  bestCombo: number;
  tutorialComplete: boolean;
  audio: boolean;
}
export const SAVE_KEY = "tiem-tra-mo.save.v1";
export function freshSave(): SaveData {
  return {
    version: 1,
    day: 1,
    money: 180000,
    reputation: 4.2,
    capacity: 1,
    speedLevel: 0,
    bestCombo: 0,
    tutorialComplete: false,
    audio: false,
  };
}
export class SaveSystem {
  warning = false;
  load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return freshSave();
      const p = JSON.parse(raw);
      if (
        p.version !== 1 ||
        !Number.isFinite(p.day) ||
        p.day < 1 ||
        !Number.isFinite(p.money) ||
        !Number.isFinite(p.reputation)
      )
        return freshSave();
      return {
        ...freshSave(),
        ...p,
        day: Math.floor(p.day),
        capacity: Math.max(1, Math.min(3, p.capacity ?? 1)),
        speedLevel: Math.max(0, Math.min(3, p.speedLevel ?? 0)),
      };
    } catch {
      this.warning = true;
      return freshSave();
    }
  }
  save(data: SaveData) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch {
      this.warning = true;
      return false;
    }
  }
}
