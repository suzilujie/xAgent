// packages/core/src/engine/TaskPipeline.ts
// 任务管道 —— 提供可观察状态容器和任务句柄的实现

import type { TaskState as TTaskState, TaskHandle, TaskResult } from '../types/index.ts'

/**
 * 可观察值包装器
 * - 内部持有一个值，支持读取和更新
 * - 更新时自动通知所有订阅者
 * - 支持函数式更新（类似 useState 的回调形式）
 */
export class Observable<T> {
  private value: T
  // 订阅者集合
  private watchers = new Set<(val: T) => void>()

  constructor(initial: T) {
    this.value = initial
  }

  /** 获取当前值 */
  get(): T {
    return this.value
  }

  /**
   * 设置新值
   * @param val - 可以直接传值，也可以传一个接收旧值并返回新值的函数
   */
  set(val: T | ((prev: T) => T)): void {
    this.value = typeof val === 'function' ? (val as (prev: T) => T)(this.value) : val
    // 通知所有订阅者
    for (const w of this.watchers) {
      w(this.value)
    }
  }

  /**
   * 订阅值的变化
   * @param watcher - 值变化时的回调函数
   * @returns 取消订阅的函数
   */
  subscribe(watcher: (val: T) => void): () => void {
    this.watchers.add(watcher)
    return () => this.watchers.delete(watcher)
  }
}

/**
 * 任务句柄实现类
 * - 封装任务执行 Promise、取消函数和可观察的状态
 * - 调用方可通过此句柄查询任务进度、获取结果或取消任务
 */
export class TaskHandleImpl<TOutput = unknown> implements TaskHandle {
  /** 任务唯一标识 */
  id: string
  /** 任务执行结果的 Promise（异步获取） */
  result: Promise<TaskResult<TOutput>>
  /** 取消任务的函数 */
  cancel: () => void
  /** 任务状态（可观察） */
  state: Observable<TTaskState>

  constructor(
    id: string,
    promise: Promise<TaskResult<TOutput>>,
    cancelFn: () => void,
    initialState: TTaskState,
  ) {
    this.id = id
    this.result = promise
    this.cancel = cancelFn
    this.state = new Observable(initialState)
  }
}
