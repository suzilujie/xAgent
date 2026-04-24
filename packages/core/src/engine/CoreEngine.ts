// packages/core/src/engine/CoreEngine.ts
// 核心引擎 —— xAgent 的大脑，负责任务调度、工具执行、生命周期管理

import { registry } from '../tools/registry.ts'
import type { AppConfig, EngineState, Task, TaskHandle, TaskResult } from '../types/index.ts'
import { TaskState } from '../types/index.ts'
import type { ToolContext } from '../types/index.ts'
import { EventBus } from './EventBus.ts'
import { Observable } from './TaskPipeline.ts'
import { TaskHandleImpl } from './TaskPipeline.ts'

/**
 * 核心引擎类
 *
 * 职责：
 * - 初始化与关闭引擎
 * - 接收任务并分发给对应工具执行
 * - 管理任务生命周期（挂起 → 运行 → 完成/失败/取消）
 * - 提供状态查询与事件订阅
 */
export class CoreEngine {
  // 应用配置
  private config!: AppConfig
  // 事件总线，用于引擎内部及对外的异步通信
  private eventBus = new EventBus()
  // 引擎状态（可观察），支持外部订阅状态变化
  private state = new Observable<EngineState>({
    initialized: false,
    activeTasks: 0,
    status: 'idle',
  })
  // 当前活跃的任务句柄映射表（taskId → TaskHandle）
  private activeHandles = new Map<string, TaskHandleImpl>()

  /**
   * 初始化引擎
   * @param config - 应用配置项
   */
  async initialize(config: AppConfig): Promise<void> {
    this.config = config
    this.state.set({ initialized: true, activeTasks: 0, status: 'idle' })
    this.eventBus.emit('engine:initialized', { config })
  }

  /**
   * 关闭引擎
   * - 取消所有活跃任务
   * - 重置状态为空闲
   */
  async shutdown(): Promise<void> {
    this.state.set((prev) => ({ ...prev, status: 'shutting-down' }))
    // 取消所有正在执行的任务
    for (const handle of this.activeHandles.values()) {
      handle.cancel()
    }
    this.activeHandles.clear()
    this.state.set({ initialized: false, activeTasks: 0, status: 'idle' })
    this.eventBus.emit('engine:shutdown')
  }

  /**
   * 提交任务到引擎执行
   * @param task - 任务描述（目标工具名称、输入参数等）
   * @returns 任务句柄，可用于查询状态、获取结果、取消任务
   */
  submit<TInput = unknown, TOutput = unknown>(task: Task<TInput>): TaskHandle {
    // 构建工具执行上下文（包含配置、事件总线、状态获取器）
    const ctx: ToolContext = {
      config: this.config,
      eventBus: this.eventBus,
      getState: () => this.state.get(),
    }

    // 任务取消标志
    let cancelled = false
    const cancelFn = () => {
      cancelled = true
      handle.state.set(TaskState.Cancelled)
      this.eventBus.emit('task:cancelled', { taskId: task.id })
    }

    // 创建任务句柄，封装异步执行 Promise 和取消逻辑
    const handle = new TaskHandleImpl<TOutput>(
      task.id,
      this.executeTask(task, ctx, () => cancelled),
      cancelFn,
      TaskState.Pending,
    )

    // 注册到活跃任务表并更新引擎状态
    this.activeHandles.set(task.id, handle)
    this.state.set((prev) => ({
      ...prev,
      activeTasks: this.activeHandles.size,
      status: 'running',
    }))

    return handle
  }

  /**
   * 执行单个任务
   * - 查找并调用目标工具
   * - 执行前进行权限检查
   * - 处理执行结果与异常
   */
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
      // 将任务状态标记为"运行中"
      handle.state.set(TaskState.Running)
      this.eventBus.emit('task:started', { taskId: task.id, toolName: task.toolName })

      // 从注册表中查找目标工具
      const tool = registry.get(task.toolName)
      if (!tool) {
        throw new Error(`Tool "${task.toolName}" not found`)
      }

      // 权限检查（如果工具定义了权限验证函数）
      if (tool.checkPermissions) {
        const perm = tool.checkPermissions(task.input, ctx)
        if (!perm.allowed) {
          throw new Error(`Permission denied: ${perm.reason}`)
        }
      }

      // 调用工具执行逻辑
      const output = (await tool.execute(task.input, ctx)) as TOutput

      // 执行完成后检查任务是否已被取消
      if (isCancelled()) {
        handle.state.set(TaskState.Cancelled)
        return { taskId: task.id, duration: performance.now() - start }
      }

      // 任务成功完成
      handle.state.set(TaskState.Completed)
      this.eventBus.emit('task:completed', { taskId: task.id })
      return { taskId: task.id, output, duration: performance.now() - start }
    } catch (err) {
      // 任务执行失败
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
      // 无论成功或失败，清理活跃任务并更新引擎状态
      this.activeHandles.delete(task.id)
      this.state.set((prev) => ({
        ...prev,
        activeTasks: this.activeHandles.size,
        status: this.activeHandles.size === 0 ? 'idle' : 'running',
      }))
    }
  }

  /** 取消指定任务 */
  cancel(taskId: string): void {
    this.activeHandles.get(taskId)?.cancel()
  }

  /** 获取当前引擎状态 */
  getState(): EngineState {
    return this.state.get()
  }

  /** 订阅引擎状态变化，返回取消订阅函数 */
  onStateChange(listener: (state: EngineState) => void): () => void {
    return this.state.subscribe(listener)
  }

  /** 订阅引擎事件，返回取消订阅函数 */
  onEvent(event: string, handler: (...args: unknown[]) => void): () => void {
    return this.eventBus.on(event, handler)
  }

  /** 获取事件总线实例 */
  getEventBus(): EventBus {
    return this.eventBus
  }
}

/** 全局引擎单例 */
let engineInstance: CoreEngine | null = null

/** 获取全局引擎实例（懒加载单例模式） */
export function getEngine(): CoreEngine {
  if (!engineInstance) {
    engineInstance = new CoreEngine()
  }
  return engineInstance
}

/** 重置引擎实例（主要用于测试） */
export function resetEngine(): void {
  engineInstance = null
}
