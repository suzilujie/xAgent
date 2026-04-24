// packages/core/src/state/selectors.ts
// 状态选择器 —— 提供从全局状态中提取特定数据的便捷函数

import type { AppState } from './types.ts'

/** 获取会话 ID */
export const selectSessionId = (state: AppState) => state.session.sessionId

/** 是否已认证 */
export const selectAuthenticated = (state: AppState) => state.session.authenticated

/** 获取主题设置 */
export const selectTheme = (state: AppState) => state.config.theme

/** 获取已注册工具列表 */
export const selectRegisteredTools = (state: AppState) => state.tools.registeredTools

/** 获取当前活跃工具 */
export const selectActiveTool = (state: AppState) => state.tools.activeTool

/** 获取任务执行历史 */
export const selectTaskHistory = (state: AppState) => state.tasks.history
