// packages/web/src/hooks/useAppState.ts
// Web 状态 Hook —— 封装 Zustand 全局状态，供 Web UI 组件订阅

import { useAppStore } from '@xagent/core'
import type { AppState } from '@xagent/core'
import { useStore } from 'zustand'

/**
 * Web 状态订阅 Hook
 * @param selector - 状态选择器函数，用于从全局状态中提取所需数据
 * @returns 选择器返回的对应状态片段
 *
 * @example
 * const sessionId = useWebState((s) => s.session.sessionId)
 */
export function useWebState<T>(selector: (state: AppState) => T): T {
  return useStore(useAppStore, selector)
}
