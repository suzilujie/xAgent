// packages/terminal/src/hooks/useAppState.ts

import { useAppStore } from '@xagent/core'
import type { AppState } from '@xagent/core'
import { useStore } from 'zustand'

export function useTerminalState<T>(selector: (state: AppState) => T): T {
  return useStore(useAppStore, selector)
}
