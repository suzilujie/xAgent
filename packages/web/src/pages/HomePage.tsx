// packages/web/src/pages/HomePage.tsx
// 首页组件 —— Web 应用的主页面，展示应用信息和会话状态

import { useWebState } from '../hooks/useAppState.ts'

/** 首页组件 —— 展示应用名称、版本号和当前会话 ID */
export function HomePage() {
  // 从全局状态中订阅当前会话 ID
  const sessionId = useWebState((s) => s.session.sessionId)

  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold text-blue-500">xAgent</h1>
      <p className="text-slate-400">v0.1.0</p>
      <p className="text-xs text-slate-600">Session: {sessionId}</p>
      <p className="text-slate-300">Ready.</p>
    </div>
  )
}
