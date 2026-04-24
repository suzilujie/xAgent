// packages/shared/src/theme.ts

export const theme = {
  colors: {
    primary: { terminal: 'cyan', web: '#3b82f6' },
    success: { terminal: 'green', web: '#22c55e' },
    error: { terminal: 'red', web: '#ef4444' },
    warning: { terminal: 'yellow', web: '#f59e0b' },
    muted: { terminal: 'gray', web: '#6b7280' },
    background: { terminal: '#1a1b26', web: '#0f172a' },
    foreground: { terminal: '#c0caf5', web: '#f8fafc' },
  },
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
} as const
