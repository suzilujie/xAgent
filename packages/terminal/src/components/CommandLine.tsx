// packages/terminal/src/components/CommandLine.tsx

import { Box, Text, useInput } from 'ink'
import { useState } from 'react'

interface CommandLineProps {
  onSubmit: (input: string) => void
}

const interactive = !!(process.stdin.isTTY && process.stdout.isTTY)

export function CommandLine({ onSubmit }: CommandLineProps) {
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useInput((input, key) => {
    if (key.return) {
      const trimmed = value.trim()
      if (trimmed) {
        setHistory((prev) => [...prev, trimmed])
        onSubmit(trimmed)
        setValue('')
        setHistoryIndex(-1)
      }
    } else if (key.backspace || key.delete) {
      setValue((prev) => prev.slice(0, -1))
    } else if (key.upArrow) {
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setValue(history[history.length - 1 - newIndex])
      }
    } else if (key.downArrow) {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setValue(history[history.length - 1 - newIndex])
      } else {
        setHistoryIndex(-1)
        setValue('')
      }
    } else if (input) {
      setValue((prev) => prev + input)
    }
  })

  if (!interactive) {
    return (
      <Box>
        <Text bold color="cyan">
          {'> '}
        </Text>
        <Text dimColor>
          (非交互终端 — 请在独立终端中运行: bun run packages/terminal/bin/cli.ts)
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text bold color="cyan">
        {'> '}
      </Text>
      <Text>{value}</Text>
      <Text color="gray">_</Text>
    </Box>
  )
}
