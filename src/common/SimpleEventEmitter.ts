export type Listener<T> = (arg: T) => void

export default class SimpleEventEmitter<T = any> {
  private events: { [event: string]: Listener<T>[] }

  constructor() {
    this.events = {}
  }

  // Subscribe to an event
  on(event: string, listener: Listener<T>): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  // Unsubscribe from an event
  off(event: string, listener: Listener<T>): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l !== listener)
    }
  }

  // Emit an event
  emit(event: string, arg: T): void {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(arg))
    }
  }
}
