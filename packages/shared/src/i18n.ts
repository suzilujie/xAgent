// packages/shared/src/i18n.ts

type Locale = 'zh-CN' | 'en-US'

const messages: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    'app.name': 'xAgent',
    'app.loading': '加载中...',
    'app.error': '发生错误',
    'app.cancel': '取消',
    'app.confirm': '确认',
    'task.running': '任务执行中',
    'task.completed': '任务完成',
    'task.failed': '任务失败',
  },
  'en-US': {
    'app.name': 'xAgent',
    'app.loading': 'Loading...',
    'app.error': 'An error occurred',
    'app.cancel': 'Cancel',
    'app.confirm': 'Confirm',
    'task.running': 'Task running',
    'task.completed': 'Task completed',
    'task.failed': 'Task failed',
  },
}

export function t(key: string, locale: Locale = 'zh-CN'): string {
  return messages[locale]?.[key] ?? key
}
