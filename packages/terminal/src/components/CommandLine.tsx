// packages/terminal/src/components/CommandLine.tsx

import { Box, Text } from 'ink'
import React, { useState, useEffect } from 'react'

interface CommandLineProps {
  onSubmit: (input: string) => void
}

const interactive = !!(process.stdin.isTTY && process.stdout.isTTY)

/** 仅在交互终端中使用的 stdin 监听 hook */
function useStdinInput(
  onChar: (
    char: string,
    key: {
      return: boolean
      backspace: boolean
      delete: boolean
      upArrow: boolean
      downArrow: boolean
    },
  ) => void,
) {
  useEffect(() => {
    if (!interactive) return

    const stdin = process.stdin
    // 按键映射（仅基础按键）
    const onData = (data: Buffer) => {
      const str = data.toString()
      // 简易解析 — 生产环境可用 readline
      const key = {
        return: false,
        backspace: false,
        delete: false,
        upArrow: false,
        downArrow: false,
      }
      if (str === '\r' || str === '\n') key.return = true
      else if (str === '\x7f' || str === '\b') key.backspace = true
      else if (data[0] === 0x1b && data[1] === 0x5b) {
        if (data[2] === 0x41) key.upArrow = true
        else if (data[2] === 0x42) key.downArrow = true
      }
      const char =
        key.return || key.backspace || key.delete || key.upArrow || key.downArrow ? '' : str
      onChar(char, key)
    }

    stdin.setRawMode(true)
    stdin.resume()
    stdin.on('data', onData)
    return () => {
      stdin.removeListener('data', onData)
      stdin.setRawMode(false)
      stdin.pause()
    }
  }, [onChar])
}

export function CommandLine({ onSubmit }: CommandLineProps) {
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  useStdinInput((input, key) => {
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
