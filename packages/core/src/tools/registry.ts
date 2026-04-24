// packages/core/src/tools/registry.ts
// 工具注册表 —— 全局工具注册、注销、查询的中心化管理

import type { Tool } from './Tool.ts'

/**
 * 工具注册表类
 * - 维护一个工具名称 → 工具实例的映射
 * - 提供注册、注销、查询、遍历等操作
 * - 防止重复注册同名工具
 */
class ToolRegistry {
  // 工具名称 → 工具实例的映射表
  private tools = new Map<string, Tool>()

  /**
   * 注册一个新工具
   * @param tool - 要注册的工具实例
   * @throws 当同名工具已存在时抛出错误
   */
  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" is already registered`)
    }
    this.tools.set(tool.name, tool)
  }

  /**
   * 注销指定名称的工具
   * @param name - 工具名称
   * @returns 是否成功移除（工具不存在时返回 false）
   */
  unregister(name: string): boolean {
    return this.tools.delete(name)
  }

  /**
   * 根据名称获取工具实例
   * @param name - 工具名称
   * @returns 对应的工具实例，未找到时返回 undefined
   */
  get<TInput = unknown, TOutput = unknown>(name: string): Tool<TInput, TOutput> | undefined {
    return this.tools.get(name) as Tool<TInput, TOutput> | undefined
  }

  /**
   * 获取所有已注册的工具列表
   * @returns 已注册工具的数组
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values())
  }

  /**
   * 检查指定名称的工具是否已注册
   * @param name - 工具名称
   * @returns 是否已注册
   */
  has(name: string): boolean {
    return this.tools.has(name)
  }

  /** 清空所有已注册的工具 */
  clear(): void {
    this.tools.clear()
  }
}

/** 全局工具注册表单例 */
export const registry = new ToolRegistry()
