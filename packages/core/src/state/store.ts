// packages/core/src/state/store.ts

import { create } from 'zustand'
import type { AppState } from './types.ts'

const initialSession = {
  sessionId: crypto.randomUUID(),
  authenticated: false,
  user: null,
}

const initialConfig = {
  theme: 'system' as const,
  locale: 'zh-CN',
  settings: {},
}

const initialTools = {
  registeredTools: [] as string[],
  activeTool: null,
}

const initialTasks = {
  history: [] as AppState['tasks']['history'],
}

export const createAppStore = (initial?: Partial<AppState>) =>
  create<AppState>(() => ({
    session: { ...initialSession, ...initial?.session },
    config: { ...initialConfig, ...initial?.config },
    tools: { ...initialTools, ...initial?.tools },
    tasks: { ...initialTasks, ...initial?.tasks },
  }))

/** 默认 Store 实例 */
export const useAppStore = createAppStore()
