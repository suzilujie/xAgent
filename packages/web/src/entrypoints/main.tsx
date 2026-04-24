// packages/web/src/entrypoints/main.tsx
// Web 应用入口 —— 挂载 React 根节点，引入全局样式

import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import '../styles/global.css'

// 获取 HTML 中的根容器元素
const el = document.getElementById('root')
if (!el) throw new Error('Root element not found')

// 创建 React 根节点并以 StrictMode 渲染应用
const root = createRoot(el)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
