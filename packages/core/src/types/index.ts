// packages/core/src/types/index.ts

/** App 配置 */
export interface AppConfig {
  /** 应用名称 */
  appName: string
  /** 版本号 */
  version: string
  /** 环境 */
  env: 'development' | 'production' | 'test'
  /** 调试模式 */
  debug?: boolean
}

/** 任务输入 */
export interface Task<TInput = unknown> {
  /** 任务 ID */
  id: string
  /** 目标工具名称 */
  toolName: string
  /** 工具输入参数 */
  input: TInput
  /** 任务优先级 */
  priority?: number
  /** 任务元数据 */
  metadata?: Record<string, unknown>
}

/** 任务状态 */
export enum TaskState {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

/** 任务结果 */
export interface TaskResult<TOutput = unknown> {
  /** 任务 ID */
  taskId: string
  /** 输出数据 */
  output?: TOutput
  /** 错误信息 */
  error?: Error
  /** 执行耗时 (ms) */
  duration: number
}

/** 权限检查结果 */
export interface PermissionResult {
  /** 是否允许 */
  allowed: boolean
  /** 拒绝原因 */
  reason?: string
}

/** 工具执行上下文 */
export interface ToolContext {
  /** App 配置 */
  config: AppConfig
  /** 事件总线 */
  eventBus: import('../engine/EventBus.ts').EventBus
  /** 获取 Store */
  getState: () => unknown
}

/** 渲染描述类型 */
export type RenderType = 'text' | 'table' | 'progress' | 'confirm' | 'select' | 'diff' | 'tree'

/** UI 中立渲染描述 */
export interface RenderDescriptor {
  type: RenderType
  props: Record<string, unknown>
}

/** 工具输出 */
export interface ToolOutput<T> {
  data: T
  render?: RenderDescriptor
}

/** 任务句柄 */
export interface TaskHandle {
  /** 任务 ID */
  id: string
  /** 任务结果 Promise */
  result: Promise<TaskResult>
  /** 取消任务 */
  cancel(): void
  /** 任务状态（可观察） */
  state: import('../engine/TaskPipeline.ts').Observable<TaskState>
}

/** 引擎状态 */
export interface EngineState {
  /** 是否已初始化 */
  initialized: boolean
  /** 当前任务数 */
  activeTasks: number
  /** 引擎状态 */
  status: 'idle' | 'running' | 'shutting-down'
}
