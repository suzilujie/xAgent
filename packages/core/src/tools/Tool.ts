// packages/core/src/tools/Tool.ts

import type { z } from 'zod'
import type { PermissionResult, ToolContext, ToolOutput } from '../types/index.ts'

export interface Tool<TInput = unknown, TOutput = unknown> {
  /** 工具唯一名称 */
  name: string
  /** 工具描述 */
  description: string
  /** Zod schema 校验输入 */
  schema: z.ZodType<TInput>
  /** 是否可用 */
  isEnabled?(ctx: ToolContext): boolean
  /** 执行工具逻辑 */
  execute(input: TInput, ctx: ToolContext): Promise<ToolOutput<TOutput> | TOutput>
  /** 权限检查 */
  checkPermissions?(input: TInput, ctx: ToolContext): PermissionResult
  /** UI 渲染提示（不绑定具体框架） */
  renderSchema?: {
    inputComponent?: 'text' | 'select' | 'confirm' | 'file' | 'code'
    outputComponent?: 'text' | 'table' | 'diff' | 'progress' | 'tree'
  }
}

type ToolPartial<TInput = unknown, TOutput = unknown> = Omit<
  Tool<TInput, TOutput>,
  'name' | 'description' | 'schema' | 'execute'
> & {
  name: string
  description: string
  schema: z.ZodType<TInput>
  execute: Tool<TInput, TOutput>['execute']
}

/** 构建工具（提供默认值） */
export function buildTool<TInput = unknown, TOutput = unknown>(
  partial: ToolPartial<TInput, TOutput>,
): Tool<TInput, TOutput> {
  return {
    isEnabled: () => true,
    ...partial,
  }
}
