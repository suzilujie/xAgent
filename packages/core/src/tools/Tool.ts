// packages/core/src/tools/Tool.ts
// 工具定义 —— 描述 Agent 可调用工具的接口与工厂函数

import type { z } from 'zod'
import type { PermissionResult, ToolContext, ToolOutput } from '../types/index.ts'

/**
 * 工具接口
 * - 每个工具需要提供名称、描述、输入 Schema 和执行函数
 * - 可选的权限检查和 UI 渲染提示
 */
export interface Tool<TInput = unknown, TOutput = unknown> {
  /** 工具唯一名称 */
  name: string
  /** 工具描述（用于展示和 LLM 上下文） */
  description: string
  /** Zod schema 用于校验工具输入参数 */
  schema: z.ZodType<TInput>
  /** 判断工具在当前上下文中是否可用 */
  isEnabled?(ctx: ToolContext): boolean
  /** 执行工具的核心逻辑 */
  execute(input: TInput, ctx: ToolContext): Promise<ToolOutput<TOutput> | TOutput>
  /** 权限检查（在执行前调用） */
  checkPermissions?(input: TInput, ctx: ToolContext): PermissionResult
  /** UI 渲染提示（框架无关），用于引导适配层选择合适的 UI 组件 */
  renderSchema?: {
    inputComponent?: 'text' | 'select' | 'confirm' | 'file' | 'code'
    outputComponent?: 'text' | 'table' | 'diff' | 'progress' | 'tree'
  }
}

/**
 * 工具部分定义类型
 * - 去除可选属性，保留必需的 name / description / schema / execute
 * - 用于 buildTool 工厂函数的参数类型
 */
type ToolPartial<TInput = unknown, TOutput = unknown> = Omit<
  Tool<TInput, TOutput>,
  'name' | 'description' | 'schema' | 'execute'
> & {
  name: string
  description: string
  schema: z.ZodType<TInput>
  execute: Tool<TInput, TOutput>['execute']
}

/**
 * 构建工具实例
 * - 为可选属性提供默认值（如 isEnabled 默认返回 true）
 * @param partial - 工具的部分定义（至少包含 name、description、schema、execute）
 * @returns 完整的工具实例
 */
export function buildTool<TInput = unknown, TOutput = unknown>(
  partial: ToolPartial<TInput, TOutput>,
): Tool<TInput, TOutput> {
  return {
    isEnabled: () => true,
    ...partial,
  }
}
