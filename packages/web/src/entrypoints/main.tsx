// packages/web/src/entrypoints/main.tsx

import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import '../styles/global.css'

const el = document.getElementById('root')
if (!el) throw new Error('Root element not found')
const root = createRoot(el)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
