// packages/core/src/engine/CoreEngine.ts

import { registry } from '../tools/registry.ts'
import type { AppConfig, EngineState, Task, TaskHandle, TaskResult } from '../types/index.ts'
import { TaskState } from '../types/index.ts'
import type { ToolContext } from '../types/index.ts'
import { EventBus } from './EventBus.ts'
import { Observable } from './TaskPipeline.ts'
import { TaskHandleImpl } from './TaskPipeline.ts'

export class CoreEngine {
  private config!: AppConfig
  private eventBus = new EventBus()
  private state = new Observable<EngineState>({
    initialized: false,
    activeTasks: 0,
    status: 'idle',
  })
  private activeHandles = new Map<string, TaskHandleImpl>()

  async initialize(config: AppConfig): Promise<void> {
    this.config = config
    this.state.set({ initialized: true, activeTasks: 0, status: 'idle' })
    this.eventBus.emit('engine:initialized', { config })
  }

  async shutdown(): Promise<void> {
    this.state.set((prev) => ({ ...prev, status: 'shutting-down' }))
    for (const handle of this.activeHandles.values()) {
      handle.cancel()
    }
    this.activeHandles.clear()
    this.state.set({ initialized: false, activeTasks: 0, status: 'idle' })
    this.eventBus.emit('engine:shutdown')
  }

  submit<TInput = unknown, TOutput = unknown>(task: Task<TInput>): TaskHandle {
    const ctx: ToolContext = {
      config: this.config,
      eventBus: this.eventBus,
      getState: () => this.state.get(),
    }

    let cancelled = false
    const cancelFn = () => {
      cancelled = true
      handle.state.set(TaskState.Cancelled)
      this.eventBus.emit('task:cancelled', { taskId: task.id })
    }

    const handle = new TaskHandleImpl<TOutput>(
      task.id,
      this.executeTask(task, ctx, () => cancelled),
      cancelFn,
      TaskState.Pending,
    )

    this.activeHandles.set(task.id, handle)
    this.state.set((prev) => ({
      ...prev,
      activeTasks: this.activeHandles.size,
      status: 'running',
    }))

    return handle
  }

  private async executeTask<TInput, TOutput>(
    task: Task<TInput>,
    ctx: ToolContext,
    isCancelled: () => boolean,
  ): Promise<TaskResult<TOutput>> {
    const handle = this.activeHandles.get(task.id)
    if (!handle) {
      throw new Error(`Task handle not found for "${task.id}"`)
    }
    const start = performance.now()

    try {
      handle.state.set(TaskState.Running)
      this.eventBus.emit('task:started', { taskId: task.id, toolName: task.toolName })

      const tool = registry.get(task.toolName)
      if (!tool) {
        throw new Error(`Tool "${task.toolName}" not found`)
      }

      if (tool.checkPermissions) {
        const perm = tool.checkPermissions(task.input, ctx)
        if (!perm.allowed) {
          throw new Error(`Permission denied: ${perm.reason}`)
        }
      }

      const output = (await tool.execute(task.input, ctx)) as TOutput

      if (isCancelled()) {
        handle.state.set(TaskState.Cancelled)
        return { taskId: task.id, duration: performance.now() - start }
      }

      handle.state.set(TaskState.Completed)
      this.eventBus.emit('task:completed', { taskId: task.id })
      return { taskId: task.id, output, duration: performance.now() - start }
    } catch (err) {
      handle.state.set(TaskState.Failed)
      this.eventBus.emit('task:failed', {
        taskId: task.id,
        error: err instanceof Error ? err.message : String(err),
      })
      return {
        taskId: task.id,
        error: err instanceof Error ? err : new Error(String(err)),
        duration: performance.now() - start,
      }
    } finally {
      this.activeHandles.delete(task.id)
      this.state.set((prev) => ({
        ...prev,
        activeTasks: this.activeHandles.size,
        status: this.activeHandles.size === 0 ? 'idle' : 'running',
      }))
    }
  }

  cancel(taskId: string): void {
    this.activeHandles.get(taskId)?.cancel()
  }

  getState(): EngineState {
    return this.state.get()
  }

  onStateChange(listener: (state: EngineState) => void): () => void {
    return this.state.subscribe(listener)
  }

  onEvent(event: string, handler: (...args: unknown[]) => void): () => void {
    return this.eventBus.on(event, handler)
  }

  getEventBus(): EventBus {
    return this.eventBus
  }
}

/** 全局引擎单例 */
let engineInstance: CoreEngine | null = null

export function getEngine(): CoreEngine {
  if (!engineInstance) {
    engineInstance = new CoreEngine()
  }
  return engineInstance
}

export function resetEngine(): void {
  engineInstance = null
}
