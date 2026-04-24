// packages/core/src/engine/TaskPipeline.ts

import type { TaskState as TTaskState, TaskHandle, TaskResult } from '../types/index.ts'

/** Observable 包装，支持监听变化 */
export class Observable<T> {
  private value: T
  private watchers = new Set<(val: T) => void>()

  constructor(initial: T) {
    this.value = initial
  }

  get(): T {
    return this.value
  }

  set(val: T | ((prev: T) => T)): void {
    this.value = typeof val === 'function' ? (val as (prev: T) => T)(this.value) : val
    for (const w of this.watchers) {
      w(this.value)
    }
  }

  subscribe(watcher: (val: T) => void): () => void {
    this.watchers.add(watcher)
    return () => this.watchers.delete(watcher)
  }
}

/** 任务句柄实现 */
export class TaskHandleImpl<TOutput = unknown> implements TaskHandle {
  id: string
  result: Promise<TaskResult<TOutput>>
  cancel: () => void
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
