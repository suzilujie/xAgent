// packages/core/src/types/index.ts
// 核心类型定义 —— 定义引擎、任务、工具、权限等全局类型

/** 应用配置 */
export interface AppConfig {
  /** 应用名称 */
  appName: string
  /** 版本号 */
  version: string
  /** 运行环境 */
  env: 'development' | 'production' | 'test'
  /** 是否开启调试模式 */
  debug?: boolean
}

/** 任务描述 —— 提交给引擎执行的工作单元 */
export interface Task<TInput = unknown> {
  /** 任务唯一标识 */
  id: string
  /** 目标工具名称 */
  toolName: string
  /** 传递给工具的输入参数 */
  input: TInput
  /** 任务优先级（数值越小优先级越高） */
  priority?: number
  /** 任务附加元数据 */
  metadata?: Record<string, unknown>
}

/** 任务生命周期状态枚举 */
export enum TaskState {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

/** 任务执行结果 */
export interface TaskResult<TOutput = unknown> {
  /** 对应的任务 ID */
  taskId: string
  /** 工具返回的输出数据 */
  output?: TOutput
  /** 执行过程中的错误信息 */
  error?: Error
  /** 执行耗时（毫秒） */
  duration: number
}

/** 权限检查结果 */
export interface PermissionResult {
  /** 是否允许执行 */
  allowed: boolean
  /** 拒绝原因（allowed 为 false 时提供） */
  reason?: string
}

/** 工具执行上下文 —— 引擎在调用工具时传入的环境信息 */
export interface ToolContext {
  /** 应用配置 */
  config: AppConfig
  /** 事件总线（用于工具向引擎发布事件） */
  eventBus: import('../engine/EventBus.ts').EventBus
  /** 获取全局 Store 状态的函数 */
  getState: () => unknown
}

/** 渲染类型枚举 —— 标识 UI 组件的展示形式 */
export type RenderType = 'text' | 'table' | 'progress' | 'confirm' | 'select' | 'diff' | 'tree'

/** UI 中立的渲染描述 —— 适配层根据此描述选择具体 UI 组件 */
export interface RenderDescriptor {
  /** 渲染类型 */
  type: RenderType
  /** 传递给 UI 组件的属性 */
  props: Record<string, unknown>
}

/** 工具输出 —— 包含数据及可选的渲染描述 */
export interface ToolOutput<T> {
  /** 工具返回的实际数据 */
  data: T
  /** 可选的 UI 渲染提示 */
  render?: RenderDescriptor
}

/** 任务句柄 —— 调用方通过此接口查询任务状态、获取结果或取消任务 */
export interface TaskHandle {
  /** 任务唯一标识 */
  id: string
  /** 异步获取任务执行结果的 Promise */
  result: Promise<TaskResult>
  /** 取消正在执行的任务 */
  cancel(): void
  /** 任务状态（可观察，支持订阅变化） */
  state: import('../engine/TaskPipeline.ts').Observable<TaskState>
}

/** 引擎状态 —— 描述引擎当前的运行状况 */
export interface EngineState {
  /** 引擎是否已完成初始化 */
  initialized: boolean
  /** 当前正在执行的任务数量 */
  activeTasks: number
  /** 引擎运行状态 */
  status: 'idle' | 'running' | 'shutting-down'
}
