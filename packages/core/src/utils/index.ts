// packages/core/src/utils/index.ts
// 通用工具函数 —— 提供项目内常用的辅助方法

/** 生成指定长度的随机短 ID（仅包含小写字母和数字） */
export function shortId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

/** 异步延迟指定毫秒数 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 安全的 JSON 解析
 * @param str - 要解析的 JSON 字符串
 * @param fallback - 解析失败时的回退默认值
 * @returns 解析结果或回退值
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
