// packages/core/src/engine/EventBus.ts
// 事件总线 —— 引擎内部的发布/订阅通信机制，用于模块间松耦合通信

/** 事件处理函数类型 */
type Handler = (...args: unknown[]) => void

/**
 * 事件总线类
 * - 支持按事件名称注册/注销监听器
 * - 触发事件时自动调用所有已注册的处理函数
 * - 处理函数中的异常会被捕获并打印，不会影响其他监听器
 */
export class EventBus {
  // 事件名称 → 监听函数集合的映射表
  private listeners = new Map<string, Set<Handler>>()

  /**
   * 注册事件监听器
   * @param event - 事件名称
   * @param handler - 事件处理函数
   * @returns 取消订阅的函数
   */
  on(event: string, handler: Handler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(handler)
    return () => this.off(event, handler)
  }

  /**
   * 注销事件监听器
   * @param event - 事件名称
   * @param handler - 要移除的处理函数
   */
  off(event: string, handler: Handler): void {
    this.listeners.get(event)?.delete(handler)
  }

  /**
   * 触发事件，通知所有监听器
   * @param event - 事件名称
   * @param args - 传递给处理函数的参数
   */
  emit(event: string, ...args: unknown[]): void {
    const handlers = this.listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      try {
        handler(...args)
      } catch (err) {
        // 捕获单个处理函数的异常，防止影响其他监听器
        console.error(`[EventBus] Error in handler for "${event}":`, err)
      }
    }
  }

  /**
   * 移除监听器
   * @param event - 指定事件名称则只移除该事件的监听器；省略则清空所有事件
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}
