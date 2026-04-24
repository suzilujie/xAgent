// packages/core/src/engine/EventBus.ts

type Handler = (...args: unknown[]) => void

export class EventBus {
  private listeners = new Map<string, Set<Handler>>()

  on(event: string, handler: Handler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(handler)
    return () => this.off(event, handler)
  }

  off(event: string, handler: Handler): void {
    this.listeners.get(event)?.delete(handler)
  }

  emit(event: string, ...args: unknown[]): void {
    const handlers = this.listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      try {
        handler(...args)
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${event}":`, err)
      }
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}
