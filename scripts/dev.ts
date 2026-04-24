#!/usr/bin/env bun

// scripts/dev.ts — 同时启动终端端 + Web 端开发服务器

import { $ } from 'bun'

const terminals = [
  $`bun --filter @xagent/terminal dev`.nothrow(),
  $`bun --filter @xagent/web dev`.nothrow(),
]

console.log('[dev] Starting terminal + web dev servers...')

const results = await Promise.allSettled(terminals)

for (const result of results) {
  if (result.status === 'rejected') {
    console.error('[dev] Server error:', result.reason)
  }
}
