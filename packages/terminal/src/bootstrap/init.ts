// packages/terminal/src/bootstrap/init.ts

import { getEngine } from '@xagent/core'
import type { AppConfig } from '@xagent/core'

const config: AppConfig = {
  appName: 'xAgent',
  version: '0.1.0',
  env: 'development',
  debug: true,
}

let initialized = false

export async function initEngine(): Promise<void> {
  if (initialized) return
  const engine = getEngine()
  await engine.initialize(config)
  initialized = true
}
