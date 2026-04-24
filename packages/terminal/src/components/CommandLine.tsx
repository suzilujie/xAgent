// packages/terminal/src/components/CommandLine.tsx
// 命令行输入组件 —— 提供终端风格的交互式命令输入界面

import { Box, Text, useInput } from 'ink'
import { useState } from 'react'

/** 组件属性定义 */
interface CommandLineProps {
  /** 用户提交命令时的回调函数 */
  onSubmit: (input: string) => void
}

// 检测当前终端是否支持交互式输入（TTY模式）
const interactive = !!(process.stdin.isTTY && process.stdout.isTTY)

/**
 * 命令行输入组件
 * - 支持键盘输入、退格删除
 * - 支持上下方向键浏览历史命令
 * - 回车提交命令并自动清空输入
 */
export function CommandLine({ onSubmit }: CommandLineProps) {
  // 当前输入框中的文本内容
  const [value, setValue] = useState('')
  // 已提交的命令历史记录列表
  const [history, setHistory] = useState<string[]>([])
  // 当前浏览历史命令时的索引位置（-1 表示不在历史浏览中）
  const [historyIndex, setHistoryIndex] = useState(-1)

  // 监听键盘输入事件
  useInput((input, key) => {
    if (key.return) {
      // 按下回车键：提交命令
      const trimmed = value.trim()
      if (trimmed) {
        // 将命令加入历史记录
        setHistory((prev) => [...prev, trimmed])
        onSubmit(trimmed)
        // 清空输入框并重置历史索引
        setValue('')
        setHistoryIndex(-1)
      }
    } else if (key.backspace || key.delete) {
      // 按下退格/删除键：删除最后一个字符
      setValue((prev) => prev.slice(0, -1))
    } else if (key.upArrow) {
      // 按下上方向键：浏览上一条历史命令
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setValue(history[history.length - 1 - newIndex])
      }
    } else if (key.downArrow) {
      // 按下下方向键：浏览下一条历史命令
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setValue(history[history.length - 1 - newIndex])
      } else {
        // 已到历史末尾，清空输入框
        setHistoryIndex(-1)
        setValue('')
      }
    } else if (input) {
      // 普通字符输入：追加到当前输入内容末尾
      setValue((prev) => prev + input)
    }
  })

  // 非交互终端时显示提示信息
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

  // 正常渲染命令行提示符 + 用户输入内容 + 闪烁光标
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
