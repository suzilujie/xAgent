// packages/terminal/src/components/OutputLog.tsx
// 输出日志组件 —— 在终端中以不同颜色展示各类日志信息

import { Box, Text } from 'ink'
import React from 'react'

/** 单条日志条目的数据结构 */
export interface LogEntry {
  /** 唯一标识 */
  id: string
  /** 日志类型：信息 | 成功 | 错误 | 系统 */
  type: 'info' | 'success' | 'error' | 'system'
  /** 日志消息内容 */
  message: string
  /** 日志产生的时间戳 */
  timestamp: Date
}

/** 组件属性定义 */
interface OutputLogProps {
  /** 需要展示的日志条目列表 */
  entries: LogEntry[]
}

// 日志类型到终端颜色的映射表
const colorMap: Record<LogEntry['type'], string> = {
  info: 'blue',
  success: 'green',
  error: 'red',
  system: 'gray',
}

/**
 * 输出日志组件
 * - 纵向排列每条日志
 * - 每条日志前显示时间戳，内容按类型着色
 */
export function OutputLog({ entries }: OutputLogProps) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      {entries.map((entry) => (
        <Box key={entry.id}>
          {/* 显示日志时间戳（灰色） */}
          <Text dimColor>[{entry.timestamp.toLocaleTimeString()}]</Text>
          <Text> </Text>
          {/* 根据日志类型选择对应颜色显示消息 */}
          <Text color={colorMap[entry.type]}>{entry.message}</Text>
        </Box>
      ))}
    </Box>
  )
}
