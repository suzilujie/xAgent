// packages/core/src/state/types.ts
// 全局状态类型定义 —— 定义应用所有状态的数据结构

/** 会话状态：管理用户会话相关信息 */
export interface SessionState {
  /** 会话 ID，唯一标识一次会话 */
  sessionId: string
  /** 用户是否已通过认证 */
  authenticated: boolean
  /** 当前登录用户信息，未登录时为 null */
  user: {
    id: string
    name: string
  } | null
}

/** 配置状态：管理应用的偏好设置 */
export interface ConfigState {
  /** 界面主题：浅色 / 深色 / 跟随系统 */
  theme: 'light' | 'dark' | 'system'
  /** 界面语言（如 'zh-CN', 'en-US'） */
  locale: string
  /** 其他自定义配置项（键值对形式） */
  settings: Record<string, unknown>
}

/** 工具状态：管理 Agent 可用工具的注册与激活 */
export interface ToolsState {
  /** 已注册的工具名称列表 */
  registeredTools: string[]
  /** 当前正在使用的工具名称，无活跃工具时为 null */
  activeTool: string | null
}

/** 任务状态：记录任务的执行历史 */
export interface TasksState {
  /** 任务历史列表，按时间顺序记录每次工具调用 */
  history: Array<{
    id: string
    toolName: string
    status: string
    timestamp: number
  }>
}

/** 应用全局状态，由以上四个子状态组合而成 */
export interface AppState {
  /** 会话状态 */
  session: SessionState
  /** 配置状态 */
  config: ConfigState
  /** 工具状态 */
  tools: ToolsState
  /** 任务状态 */
  tasks: TasksState
}
