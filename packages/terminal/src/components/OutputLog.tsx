// packages/terminal/src/components/OutputLog.tsx

import { Box, Text } from 'ink'
import React from 'react'

export interface LogEntry {
  id: string
  type: 'info' | 'success' | 'error' | 'system'
  message: string
  timestamp: Date
}

interface OutputLogProps {
  entries: LogEntry[]
}

const colorMap: Record<LogEntry['type'], string> = {
  info: 'blue',
  success: 'green',
  error: 'red',
  system: 'gray',
}

export function OutputLog({ entries }: OutputLogProps) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      {entries.map((entry) => (
        <Box key={entry.id}>
          <Text dimColor>[{entry.timestamp.toLocaleTimeString()}]</Text>
          <Text> </Text>
          <Text color={colorMap[entry.type]}>{entry.message}</Text>
        </Box>
      ))}
    </Box>
  )
}
