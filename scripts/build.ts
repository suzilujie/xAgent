#!/usr/bin/env bun

// scripts/build.ts — 构建所有包

import { $ } from 'bun'

console.log('[build] Building core...')
await $`bun --filter @xagent/core build`.nothrow()

console.log('[build] Building shared...')
await $`bun --filter @xagent/shared build`.nothrow()

console.log('[build] Building terminal...')
await $`bun --filter @xagent/terminal build`.nothrow()

console.log('[build] Building web...')
await $`bun --filter @xagent/web build`.nothrow()

console.log('[build] Done.')
