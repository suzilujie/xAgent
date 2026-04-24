// packages/web/src/entrypoints/App.tsx
// Web 应用根组件 —— 作为 React 组件树的顶层容器

import { HomePage } from '../pages/HomePage.tsx'

/** 应用根组件 —— 使用全屏居中布局渲染首页 */
export function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <HomePage />
    </div>
  )
}
