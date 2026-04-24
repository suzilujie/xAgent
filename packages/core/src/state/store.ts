// packages/core/src/state/store.ts
// 全局状态 Store —— 基于 Zustand 创建应用的全局状态管理

import { create } from 'zustand'
import type { AppState } from './types.ts'

// ─── 各子状态的初始值 ───

/** 会话初始状态：随机生成会话 ID，未认证，无用户信息 */
const initialSession = {
  sessionId: crypto.randomUUID(),
  authenticated: false,
  user: null,
}

/** 配置初始状态：跟随系统主题，中文语言，无自定义设置 */
const initialConfig = {
  theme: 'system' as const,
  locale: 'zh-CN',
  settings: {},
}

/** 工具初始状态：无已注册工具，无活跃工具 */
const initialTools = {
  registeredTools: [] as string[],
  activeTool: null,
}

/** 任务初始状态：空的历史记录 */
const initialTasks = {
  history: [] as AppState['tasks']['history'],
}

/**
 * 创建应用 Store 工厂函数
 * @param initial - 可选的部分初始状态，用于测试或自定义覆盖
 * @returns Zustand Store 实例
 */
export const createAppStore = (initial?: Partial<AppState>) =>
  create<AppState>(() => ({
    // 使用展开运算符合并默认值和自定义初始值
    session: { ...initialSession, ...initial?.session },
    config: { ...initialConfig, ...initial?.config },
    tools: { ...initialTools, ...initial?.tools },
    tasks: { ...initialTasks, ...initial?.tasks },
  }))

/** 默认全局 Store 实例，供整个应用直接使用 */
export const useAppStore = createAppStore()
