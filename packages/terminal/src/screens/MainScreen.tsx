// packages/terminal/src/screens/MainScreen.tsx
// 主屏幕组件 —— 应用的主界面，包含日志输出区域和命令行输入区域

import { Box, Text, useApp } from 'ink'
import React, { useCallback, useState } from 'react'
import { CommandLine } from '../components/CommandLine.tsx'
import { OutputLog } from '../components/OutputLog.tsx'
import type { LogEntry } from '../components/OutputLog.tsx'
import { useTerminalState } from '../hooks/useAppState.ts'

/**
 * 向日志列表追加一条新记录
 * @param prev - 现有的日志列表
 * @param type - 日志类型
 * @param message - 日志消息内容
 * @returns 新的日志列表（不可变更新）
 */
function addLog(prev: LogEntry[], type: LogEntry['type'], message: string): LogEntry[] {
  return [...prev, { id: crypto.randomUUID(), type, message, timestamp: new Date() }]
}

/**
 * 主屏幕组件
 * - 顶部显示应用名称和版本
 * - 中部展示日志输出
 * - 底部提供命令行输入
 * - 内置 help / status / tools / echo / clear / exit 命令
 */
export function MainScreen() {
  // Ink 提供的应用控制方法（用于退出等操作）
  const { exit } = useApp()
  // 从全局状态中订阅当前会话 ID
  const sessionId = useTerminalState((s) => s.session.sessionId)

  // 日志状态：初始化时包含一条欢迎消息
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    {
      id: '0',
      type: 'system',
      message: 'xAgent v0.1.0 — 输入命令开始交互 (help 查看帮助)',
      timestamp: new Date(),
    },
  ])

  /**
   * 命令处理函数
   * - 将用户输入解析为命令和参数
   * - 根据命令类型执行对应逻辑并输出日志
   */
  const handleCommand = useCallback(
    (input: string) => {
      // 先将用户输入作为信息日志展示
      setLogs((prev) => addLog(prev, 'info', `$ ${input}`))

      // 按空格拆分，提取命令名称和参数列表
      const [cmd, ...args] = input.split(/\s+/)
      const command = cmd.toLowerCase()

      switch (command) {
        case 'help':
          // 显示帮助信息：列出所有可用命令
          setLogs((prev) =>
            [
              '可用命令:',
              '  help     — 显示帮助信息',
              '  status   — 查看引擎状态',
              '  tools    — 查看已注册工具',
              '  echo     — 回显消息 (echo <msg>)',
              '  clear    — 清空输出',
              '  exit     — 退出',
            ].reduce((acc, msg) => addLog(acc, 'system', msg), prev),
          )
          break

        case 'status':
          // 显示引擎运行状态和当前会话信息
          setLogs((prev) =>
            (
              [
                ['system', `Session: ${sessionId}`],
                ['success', '引擎运行中 ✓'],
              ] as [LogEntry['type'], string][]
            ).reduce<LogEntry[]>((acc, [type, msg]) => addLog(acc, type, msg), prev),
          )
          break

        case 'tools':
          // 查看已注册的工具列表（当前为占位实现）
          setLogs((prev) => addLog(prev, 'system', '暂无已注册工具'))
          break

        case 'echo':
          // 回显用户输入的参数内容
          setLogs((prev) => addLog(prev, 'info', args.join(' ')))
          break

        case 'clear':
          // 清空所有日志输出
          setLogs([])
          break

        case 'exit':
          // 显示告别消息并退出应用
          setLogs((prev) => addLog(prev, 'system', '再见!'))
          exit()
          break

        default:
          // 未知命令：提示用户输入 help 查看帮助
          setLogs((prev) => addLog(prev, 'error', `未知命令: ${command} (输入 help 查看帮助)`))
      }
    },
    [sessionId],
  )

  return (
    <Box flexDirection="column" padding={1}>
      {/* 顶部标题栏：应用名称 + 版本号 */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          xAgent
        </Text>
        <Text dimColor> v0.1.0</Text>
      </Box>
      {/* 日志输出区域 */}
      <OutputLog entries={logs} />
      {/* 命令行输入区域 */}
      <CommandLine onSubmit={handleCommand} />
    </Box>
  )
}
