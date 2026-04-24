// packages/shared/src/theme.ts
// 主题配置 —— 定义跨平台（终端/Web）统一的设计令牌（颜色、间距等）

/** 全局主题令牌 */
export const theme = {
  // 颜色系统：每种颜色同时提供终端颜色名和 Web 十六进制色值
  colors: {
    primary: { terminal: 'cyan', web: '#3b82f6' },
    success: { terminal: 'green', web: '#22c55e' },
    error: { terminal: 'red', web: '#ef4444' },
    warning: { terminal: 'yellow', web: '#f59e0b' },
    muted: { terminal: 'gray', web: '#6b7280' },
    background: { terminal: '#1a1b26', web: '#0f172a' },
    foreground: { terminal: '#c0caf5', web: '#f8fafc' },
  },
  // 间距系统（像素值）
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
} as const
