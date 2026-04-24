// packages/terminal/src/bootstrap/init.ts
// 引擎初始化模块 —— 负责在应用启动时初始化核心引擎

import { getEngine } from '@xagent/core'
import type { AppConfig } from '@xagent/core'

// 应用配置：名称、版本、运行环境、调试开关
const config: AppConfig = {
  appName: 'xAgent',
  version: '0.1.0',
  env: 'development',
  debug: true,
}

// 引擎是否已完成初始化的标记（防止重复初始化）
let initialized = false

/**
 * 初始化引擎（单例模式）
 * - 首次调用时会创建并初始化引擎实例
 * - 后续调用直接返回，避免重复初始化
 */
export async function initEngine(): Promise<void> {
  if (initialized) return
  const engine = getEngine()
  await engine.initialize(config)
  initialized = true
}
