// packages/shared/src/i18n.ts
// 国际化模块 —— 提供中英文的多语言翻译支持

/** 支持的语言区域 */
type Locale = 'zh-CN' | 'en-US'

/** 各语言的翻译消息映射表（key → 翻译文本） */
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

/**
 * 翻译函数 —— 根据语言区域获取对应的翻译文本
 * @param key - 翻译键
 * @param locale - 目标语言区域（默认中文）
 * @returns 翻译后的文本，未找到时返回原始 key
 */
export function t(key: string, locale: Locale = 'zh-CN'): string {
  return messages[locale]?.[key] ?? key
}
