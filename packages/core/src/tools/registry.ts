// packages/core/src/tools/registry.ts

import type { Tool } from './Tool.ts'

class ToolRegistry {
  private tools = new Map<string, Tool>()

  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" is already registered`)
    }
    this.tools.set(tool.name, tool)
  }

  unregister(name: string): boolean {
    return this.tools.delete(name)
  }

  get<TInput = unknown, TOutput = unknown>(name: string): Tool<TInput, TOutput> | undefined {
    return this.tools.get(name) as Tool<TInput, TOutput> | undefined
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values())
  }

  has(name: string): boolean {
    return this.tools.has(name)
  }

  clear(): void {
    this.tools.clear()
  }
}

/** 全局工具注册表单例 */
export const registry = new ToolRegistry()
