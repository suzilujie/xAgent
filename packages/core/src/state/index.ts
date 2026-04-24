// packages/core/src/state/index.ts
// 状态管理模块统一导出

export { createAppStore, useAppStore } from './store.ts'
export type { AppState } from './types.ts'
export * as selectors from './selectors.ts'
