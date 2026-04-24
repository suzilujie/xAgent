// packages/terminal/src/screens/MainScreen.tsx

import { Box, Text } from 'ink'
import React, { useCallback, useState } from 'react'
import { CommandLine } from '../components/CommandLine.tsx'
import { OutputLog } from '../components/OutputLog.tsx'
import type { LogEntry } from '../components/OutputLog.tsx'
import { useTerminalState } from '../hooks/useAppState.ts'

function addLog(prev: LogEntry[], type: LogEntry['type'], message: string): LogEntry[] {
  return [...prev, { id: crypto.randomUUID(), type, message, timestamp: new Date() }]
}

export function MainScreen() {
  const sessionId = useTerminalState((s) => s.session.sessionId)
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    {
      id: '0',
      type: 'system',
      message: 'xAgent v0.1.0 — 输入命令开始交互 (help 查看帮助)',
      timestamp: new Date(),
    },
  ])

  const handleCommand = useCallback(
    (input: string) => {
      setLogs((prev) => addLog(prev, 'info', `$ ${input}`))

      const [cmd, ...args] = input.split(/\s+/)
      const command = cmd.toLowerCase()

      switch (command) {
        case 'help':
          setLogs((prev) => [
            ...addLog(prev, 'system', '可用命令:'),
            ...addLog(prev, 'system', '  help     — 显示帮助信息'),
            ...addLog(prev, 'system', '  status   — 查看引擎状态'),
            ...addLog(prev, 'system', '  tools    — 查看已注册工具'),
            ...addLog(prev, 'system', '  echo     — 回显消息 (echo <msg>)'),
            ...addLog(prev, 'system', '  clear    — 清空输出'),
            ...addLog(prev, 'system', '  exit     — 退出'),
          ])
          break

        case 'status':
          setLogs((prev) => [
            ...addLog(prev, 'system', `Session: ${sessionId}`),
            ...addLog(prev, 'success', '引擎运行中 ✓'),
          ])
          break

        case 'tools':
          setLogs((prev) => addLog(prev, 'system', '暂无已注册工具'))
          break

        case 'echo':
          setLogs((prev) => addLog(prev, 'info', args.join(' ')))
          break

        case 'clear':
          setLogs([])
          break

        case 'exit':
          setLogs((prev) => addLog(prev, 'system', '按 Ctrl+C 退出'))
          break

        default:
          setLogs((prev) => addLog(prev, 'error', `未知命令: ${command} (输入 help 查看帮助)`))
      }
    },
    [sessionId],
  )

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          xAgent
        </Text>
        <Text dimColor> v0.1.0</Text>
      </Box>
      <OutputLog entries={logs} />
      <CommandLine onSubmit={handleCommand} />
    </Box>
  )
}
