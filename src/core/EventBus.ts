export type GameEvent =
  | "ORDER_CREATED"
  | "ORDER_ACCEPTED"
  | "DRINK_CREATED"
  | "DRINK_COMPLETED"
  | "CUSTOMER_SERVED"
  | "CUSTOMER_LEFT"
  | "MONEY_GAINED"
  | "COMBO_CHANGED";
export class EventBus {
  private listeners = new Map<GameEvent, Set<(data: unknown) => void>>();
  on(event: GameEvent, listener: (data: unknown) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }
  emit(event: GameEvent, data: unknown) {
    this.listeners.get(event)?.forEach((listener) => listener(data));
  }
  clear() {
    this.listeners.clear();
  }
}
