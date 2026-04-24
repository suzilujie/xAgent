// packages/terminal/src/main.tsx
// 应用入口文件 —— 初始化引擎并渲染主界面

import React from 'react'
import { initEngine } from './bootstrap/init.ts'
import { MainScreen } from './screens/MainScreen.tsx'

/**
 * 应用根组件
 * - 组件挂载时自动初始化核心引擎
 * - 引擎就绪后渲染主屏幕界面
 */
export function Main() {
  // 组件首次挂载时执行引擎初始化（仅执行一次）
  React.useEffect(() => {
    initEngine().catch(console.error)
  }, [])

  // 渲染主屏幕
  return React.createElement(MainScreen)
}

export { Main as MainScreen }
