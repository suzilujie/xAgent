// packages/core/src/state/types.ts

export interface SessionState {
  /** 会话 ID */
  sessionId: string
  /** 是否已认证 */
  authenticated: boolean
  /** 用户信息 */
  user: {
    id: string
    name: string
  } | null
}

export interface ConfigState {
  /** 主题 */
  theme: 'light' | 'dark' | 'system'
  /** 语言 */
  locale: string
  /** 其他配置 */
  settings: Record<string, unknown>
}

export interface ToolsState {
  /** 已注册工具列表 */
  registeredTools: string[]
  /** 当前活跃工具 */
  activeTool: string | null
}

export interface TasksState {
  /** 任务历史 */
  history: Array<{
    id: string
    toolName: string
    status: string
    timestamp: number
  }>
}

export interface AppState {
  session: SessionState
  config: ConfigState
  tools: ToolsState
  tasks: TasksState
}
