#!/usr/bin/env bun

import { render } from 'ink'
import React from 'react'
import { MainScreen } from '../src/main.tsx'
import { getEngine } from '@xagent/core'

const interactive = process.stdin.isTTY && process.stdout.isTTY

if (!interactive) {
  console.log('xAgent v0.1.0')
  console.log('')
  console.log('请在独立的交互式终端中运行此命令 (不支持 IDE 内置终端):')
  console.log('')
  console.log('  bun run packages/terminal/bin/cli.ts')
  console.log('')
  process.exit(0)
}

const { waitUntilExit, unmount } = render(React.createElement(MainScreen))

function gracefulShutdown() {
  const engine = getEngine()
  engine.shutdown()
    .catch(() => {})
    .finally(() => {
      unmount()
      process.exit(0)
    })
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

waitUntilExit().then(() => {
  const engine = getEngine()
  engine.shutdown().catch(() => {})
})
