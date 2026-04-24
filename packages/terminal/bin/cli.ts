#!/usr/bin/env bun
// packages/terminal/bin/cli.ts
// 终端 CLI 入口 —— 启动交互式终端界面，管理进程生命周期

import { render } from 'ink'
import React from 'react'
import { MainScreen } from '../src/main.tsx'
import { getEngine } from '@xagent/core'

// 检测是否在交互式终端（TTY）中运行
const interactive = process.stdin.isTTY && process.stdout.isTTY

// 非交互模式下输出提示信息后退出
if (!interactive) {
  console.log('xAgent v0.1.0')
  console.log('')
  console.log('请在独立的交互式终端中运行此命令 (不支持 IDE 内置终端):')
  console.log('')
  console.log('  bun run packages/terminal/bin/cli.ts')
  console.log('')
  process.exit(0)
}

// 使用 Ink 渲染 React 终端 UI
const { waitUntilExit, unmount } = render(React.createElement(MainScreen))

/**
 * 优雅关闭函数
 * - 关闭引擎（释放资源）
 * - 卸载 Ink 渲染
 * - 退出进程
 */
function gracefulShutdown() {
  const engine = getEngine()
  engine.shutdown()
    .catch(() => {})
    .finally(() => {
      unmount()
      process.exit(0)
    })
}

// 监听进程终止信号（Ctrl+C / kill 命令）
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

// Ink 退出后清理引擎
waitUntilExit().then(() => {
  const engine = getEngine()
  engine.shutdown().catch(() => {})
})
