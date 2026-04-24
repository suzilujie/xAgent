// packages/terminal/src/main.tsx

import React from 'react'
import { initEngine } from './bootstrap/init.ts'
import { MainScreen } from './screens/MainScreen.tsx'

export function Main() {
  React.useEffect(() => {
    initEngine().catch(console.error)
  }, [])

  return React.createElement(MainScreen)
}

export { Main as MainScreen }
