# SPEC.md — 双端交互式应用技术规格（Terminal + Web）

---

## 1. 项目概述

基于**共享核心引擎 + 双端 UI** 架构构建的交互式应用。核心业务逻辑（引擎、工具、状态、服务）完全共享，UI 层分别面向**终端**（Ink）和**Web**（React DOM）提供原生体验。采用 Monorepo 管理多包。

> 具体业务功能待定，本规格聚焦于技术架构与基础设施。

---

## 2. 技术栈

| 层级 | 选型 | 说明 |
|---|---|---|
| **运行时** | Bun | 终端端运行时 + 构建工具 |
| **语言** | TypeScript + TSX | 全栈统一语言 |
| **包管理** | Bun Workspaces | Monorepo 管理 |
| **终端 UI** | Ink (React for CLI) | 终端端组件化渲染 |
| **Web UI** | React 19 + Vite | Web 端 SPA |
| **Web 框架** | React Router v7 | 路由（或 Next.js，按需） |
| **组件库** | shadcn/ui + TailwindCSS v4 | Web 端 UI 组件 |
| **状态管理** | Zustand | 双端共享状态 |
| **样式方案** | TailwindCSS v4 | Web 端样式；终端端用 Ink 内置 |
| **Schema 校验** | Zod | 运行时类型校验 |
| **数据持久化** | SQLite (bun:sqlite) | 本地存储 |
| **API 通信** | Hono / Elysia | Web 端后端 API（可选） |
| **实时通信** | WebSocket / SSE | Web 端流式推送 |
| **代码质量** | Biome | Lint + Format + 类型检查 |

---

## 3. 系统架构

### 3.1 Monorepo 结构总览

```
┌─────────────────────────────────────────────────────┐
│                    packages/core                     │
│  引擎 + 工具系统 + 状态管理 + 服务层 + 类型 + 工具函数  │
├──────────────────────┬──────────────────────────────┤
│   packages/terminal  │        packages/web           │
│   Ink 终端 UI        │   React DOM Web UI            │
│   CLI 入口           │   Vite 开发服务器              │
├──────────────────────┴──────────────────────────────┤
│                    packages/shared                    │
│   双端共享常量、主题配置、通用类型                      │
└─────────────────────────────────────────────────────┘
```

### 3.2 分层架构图

```
┌──────────────────┐     ┌──────────────────┐
│   终端 UI 层      │     │    Web UI 层      │
│   Ink + React    │     │  React + Vite    │
│   CLI 渲染        │     │  浏览器渲染       │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         └──────────┬─────────────┘
                    ▼
         ┌─────────────────────┐
         │    界面抽象层 (可选)   │
         │  Screen / Page 描述  │
         └────────┬────────────┘
                  ▼
┌─────────────────────────────────────────┐
│              共享核心层                    │
├──────────┬──────────┬───────────────────┤
│  引擎层   │  状态层   │    工具层          │
│  Engine   │  Zustand │   Tool + Registry │
├──────────┴──────────┴───────────────────┤
│              服务层                       │
│  API 客户端 / 存储 / 协议 / 事件总线      │
├─────────────────────────────────────────┤
│              基础层                       │
│  类型定义 / 常量 / 工具函数 / 校验         │
└─────────────────────────────────────────┘
```

### 3.3 核心设计模式

| 模式 | 说明 |
|---|---|
| **Monorepo 共享核心** | Engine / State / Tools / Services 在 `core` 包中，双端引用同一份代码 |
| **UI 适配层** | 核心层不依赖任何 UI 框架；终端端用 Ink 组件，Web 端用 React DOM 组件 |
| **插件化工具** | 每个功能模块实现统一 `Tool` 接口，通过注册表动态加载 |
| **统一状态** | Zustand Store 双端共享，selector 优化渲染 |
| **流式处理** | 终端端直接流式渲染；Web 端通过 SSE/WebSocket 推送 |
| **事件驱动** | EventBus 解耦模块间通信 |
| **权限系统** | 三级检查：模块级 → 规则级 → 用户审批 |

---

## 4. 目录结构

```
project-root/
├── package.json                # Workspace 根配置
├── biome.json                  # 统一代码质量配置
├── tsconfig.base.json          # 共享 TS 配置
├── turbo.json                  # Turborepo 任务编排（可选，或用 Bun）
│
├── packages/
│   │
│   ├── core/                   # 共享核心包（双端依赖）
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── engine/         # 核心引擎
│   │       │   ├── CoreEngine.ts
│   │       │   ├── TaskPipeline.ts
│   │       │   └── EventBus.ts
│   │       ├── tools/          # 插件化工具系统
│   │       │   ├── Tool.ts             # 接口 + 工厂
│   │       │   ├── registry.ts         # 注册表
│   │       │   └── <ToolName>/         # 各工具实现
│   │       ├── state/          # 状态管理
│   │       │   ├── types.ts
│   │       │   ├── store.ts
│   │       │   └── selectors.ts
│   │       ├── services/       # 服务层
│   │       │   ├── api/
│   │       │   ├── storage/
│   │       │   └── protocol/
│   │       ├── types/          # 全局类型
│   │       ├── constants/      # 常量与配置默认值
│   │       └── utils/          # 纯工具函数（无 UI 依赖）
│   │
│   ├── shared/                 # 双端共享 UI 常量
│   │   ├── package.json
│   │   └── src/
│   │       ├── theme.ts        # 主题令牌（颜色、间距映射终端/Web）
│   │       ├── i18n.ts         # 国际化字符串
│   │       └── types.ts        # 共享 UI 类型
│   │
│   ├── terminal/               # 终端端应用
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── bin/
│   │   │   └── cli.ts          # 可执行入口（#!/usr/bin/env bun）
│   │   └── src/
│   │       ├── entrypoints/    # 入口引导
│   │       ├── main.tsx        # CLI 主逻辑
│   │       ├── screens/        # Ink Screen 组件
│   │       ├── components/     # Ink 可复用组件
│   │       ├── hooks/          # 终端专属 hooks（useInput 等）
│   │       └── bootstrap/      # 启动初始化
│   │
│   └── web/                    # Web 端应用
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── public/
│       └── src/
│           ├── entrypoints/    # Web 入口
│           │   ├── main.tsx    # SPA 挂载
│           │   └── App.tsx     # 路由 + Provider
│           ├── pages/          # 页面组件（对应 Screen）
│           ├── components/     # Web UI 组件（shadcn/ui）
│           ├── hooks/          # Web 专属 hooks（useWebSocket 等）
│           ├── layouts/        # 页面布局
│           ├── api/            # 前端 API 调用层
│           └── styles/         # 全局样式
│
├── apps/                       # 独立应用入口（可选，独立于 packages）
│   └── server/                 # Web 后端服务（如需要）
│       ├── package.json
│       └── src/
│           ├── index.ts        # Hono / Elysia 服务
│           ├── routes/
│           └── middleware/
│
└── scripts/                    # 开发脚本
    ├── dev.ts                  # 同时启动终端/Web 开发服务器
    └── build.ts                # 构建所有包
```

---

## 5. 核心模块接口设计

### 5.1 Tool 接口（双端共享）

```typescript
// packages/core/src/tools/Tool.ts

interface Tool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  schema: ZodSchema<TInput>;

  isEnabled?(ctx: ToolContext): boolean;
  execute(input: TInput, ctx: ToolContext): Promise<TOutput>;
  checkPermissions?(input: TInput, ctx: ToolContext): PermissionResult;

  // 可选 UI 描述（不绑定具体 UI 框架）
  renderSchema?: {
    inputComponent?: 'text' | 'select' | 'confirm' | 'file' | 'code';
    outputComponent?: 'text' | 'table' | 'diff' | 'progress' | 'tree';
  };
}

function buildTool<T>(partial: Partial<Tool<T>>): Tool<T>;
```

### 5.2 CoreEngine 接口（双端共享）

```typescript
// packages/core/src/engine/CoreEngine.ts

interface CoreEngine {
  initialize(config: AppConfig): Promise<void>;
  shutdown(): Promise<void>;

  submit(task: Task): TaskHandle;
  cancel(taskId: string): void;

  getState(): EngineState;
  onStateChange(listener: (state: EngineState) => void): () => void;
  onEvent(event: string, listener: Handler): () => void;
}

interface TaskHandle {
  id: string;
  result: Promise<TaskResult>;
  cancel(): void;
  state: Observable<TaskState>;
}
```

### 5.3 AppState（双端共享）

```typescript
// packages/core/src/state/types.ts

interface AppState {
  session: SessionState;
  config: ConfigState;
  tools: ToolsState;
  tasks: TasksState;
}

// packages/core/src/state/store.ts
function createAppStore(initial?: Partial<AppState>): StoreApi<AppState>;

// 终端端使用
// packages/terminal/src/hooks/useAppState.ts
function useTerminalState<T>(selector: (state: AppState) => T): T;

// Web 端使用
// packages/web/src/hooks/useAppState.ts
function useWebState<T>(selector: (state: AppState) => T): T;
```

### 5.4 UI 适配层（可选）

```typescript
// packages/core/src/ui/ToolRenderer.ts — UI 中立渲染描述

interface RenderDescriptor {
  type: 'text' | 'table' | 'progress' | 'confirm' | 'select' | 'diff' | 'tree';
  props: Record<string, unknown>;
}

// 工具可以返回渲染描述而非绑定具体组件
interface ToolOutput<T> {
  data: T;
  render?: RenderDescriptor;
}
```

---

## 6. 双端通信架构

### 6.1 终端端 — 直接调用

```
用户输入 → Screen → CoreEngine.submit()
  → Tool.execute() → 流式更新 Zustand Store
  → Ink 组件响应 Store 变化重新渲染
```

### 6.2 Web 端 — 前后端分离（按需选择）

**模式 A：纯客户端（SPA，无需后端）**

```
浏览器 → React → CoreEngine.submit()
  → Tool.execute()（浏览器内执行）
  → Zustand Store → React 组件更新
```

**模式 B：客户端 + API 服务端**

```
浏览器 → React → fetch/WebSocket → API Server (Hono)
  → CoreEngine.submit()（服务端执行）
  → SSE/WebSocket 推送结果
  → React 组件更新
```

> **推荐默认：模式 A** — 初期优先实现纯客户端模式，Tool 在浏览器内直接执行。后续有服务端需求时，通过接口抽象切换为模式 B，无需改动核心引擎代码。

---

## 7. 主题适配策略

```typescript
// packages/shared/src/theme.ts

export const theme = {
  colors: {
    primary:     { terminal: 'cyan',   web: '#3b82f6' },
    success:     { terminal: 'green',  web: '#22c55e' },
    error:       { terminal: 'red',    web: '#ef4444' },
    warning:     { terminal: 'yellow', web: '#f59e0b' },
    muted:       { terminal: 'gray',   web: '#6b7280' },
  },
  spacing: { /* 双端通用 */ },
};
```

---

## 8. 关键流程

### 8.1 应用启动（双端）

```
终端端:
  bin/cli.ts → init() → main.tsx → CoreEngine.initialize() → Ink.render(<MainScreen />)

Web 端:
  index.html → main.tsx → React.render(<App />) → CoreEngine.initialize() → 路由渲染
```

### 8.2 任务执行（双端）

```
用户操作 → UI 组件 → CoreEngine.submit(task)
  ├─ 权限检查（Tool.checkPermissions）
  ├─ 查找工具（Registry）
  ├─ 执行（Tool.execute）— 异步/流式
  ├─ Store 更新
  └─ UI 响应式更新（Ink / React DOM）
```

---

## 9. 开发工作流

```bash
# 安装依赖
bun install

# 开发模式 — 同时启动终端端 + Web 端
bun run dev

# 仅终端端开发
bun run dev:terminal

# 仅 Web 端开发
bun run dev:web

# 构建
bun run build              # 构建所有包

# 构建 & 安装终端 CLI
bun run build:terminal && bun link

# 代码检查
bun run lint
bun run check              # 类型检查 + Lint
```

---

## 10. 质量标准

| 维度 | 标准 |
|---|---|
| **类型覆盖** | `strict: true`，禁止 `any`，核心包 100% 类型覆盖 |
| **代码风格** | Biome 统一配置，CI 强制检查 |
| **包边界** | `core` 不可依赖 `terminal` 或 `web`，只能被它们依赖 |
| **UI 无关性** | `core` 中不得出现 `react`、`ink`、`chalk` 等 UI 依赖 |
| **测试** | 核心逻辑单测覆盖；工具独立测试 |
| **构建产物** | 终端端单文件 `cli.js`；Web 端 `dist/` 静态文件 |

---

## 11. 功能清单

> 待补充。后续在此处添加具体业务功能模块。

---

## 12. 里程碑（技术架构）

| 阶段 | 目标 | 交付物 |
|---|---|---|
| **P0 - 骨架** | Monorepo 搭建 + 包结构 | workspace 配置、目录结构、tsconfig 继承 |
| **P1 - 核心** | 共享引擎 + 工具系统 | CoreEngine、Tool 接口、Registry、Zustand Store |
| **P2 - 终端** | 终端 UI + CLI | Ink 渲染、Screen、组件、CLI 入口 |
| **P3 - Web** | Web UI + 开发服务器 | Vite + React、页面、路由、组件库集成 |
| **P4 - 服务** | 存储 + 通信 | SQLite 持久化、SSE/WebSocket 流式（Web 端） |
| **P5 - 打磨** | 主题适配 + 构建 + 部署 | 双端主题统一、构建脚本、发布流程 |

---

## 13. 发布流程

### 13.1 版本管理策略

- 采用 **SemVer** 语义化版本（`MAJOR.MINOR.PATCH`）
- 所有包（`core`、`shared`、`terminal`、`web`）版本号保持同步
- 每次发布自动创建 Git Tag（格式：`v{version}`）

### 13.2 发布命令

```bash
# 补丁版本（默认）— 修复 bug、小改动
bun run release          # 或 bun run release:patch

# 次版本 — 新增功能、向后兼容
bun run release:minor

# 主版本 — 破坏性变更
bun run release:major
```

### 13.3 发布流程（自动化 7 步）

```
[1/7] 前置检查        — Lint + 类型检查
[2/7] 工作区检查      — 确认无未提交变更
[3/7] 分支检查        — 确认在 main 分支（可跳过）
[4/7] 拉取最新代码    — git pull --ff-only
[5/7] 全量构建        — bun run build
[6/7] 版本号升级      — 同步更新所有包 package.json
[7/7] Git 提交 & 标签 — commit + tag v{version}
```

> 发布脚本：`scripts/release.ts`

### 13.4 发布后操作

发布脚本完成后，需手动执行推送与部署：

```bash
# 推送代码 + 标签到远程
git push origin main --tags

# 终端端发布（可选 — 如需发布到 npm）
npm publish --access public

# Web 端部署（推送后自动触发 CI/CD，或手动部署）
# 详见 §13.6
```

### 13.5 终端端（CLI）发布

终端端作为 CLI 工具发布到 npm Registry：

```bash
# 本地构建
bun run build:terminal

# 测试安装
cd packages/terminal && npm link
xagent --help

# 发布（需先移除 private: true）
cd packages/terminal
npm publish
```

> 用户安装：`npm install -g @xagent/terminal` 或 `bun add -g @xagent/terminal`

### 13.6 Web 端部署

Web 端为静态 SPA，构建产物在 `packages/web/dist/`，支持以下部署方式：

| 方式 | 配置文件 | 触发方式 |
|---|---|---|
| **Vercel** | `vercel.json`（项目根） | `git push` 自动部署 |
| **Netlify** | `netlify.toml`（项目根） | `git push` 自动部署 |
| **Cloudflare Pages** | `wrangler.toml` | `git push` 自动部署 |
| **EdgeOne Pages** | 腾讯云集成 | CI/CD 或手动 |
| **自定义服务器** | Dockerfile + Nginx | 手动或 CI |

部署配置示例（以 Vercel 为例）：

```json
// vercel.json
{
  "buildCommand": "cd packages/web && bun install && bun run build",
  "outputDirectory": "packages/web/dist",
  "framework": "vite"
}
```

### 13.7 回滚策略

```bash
# 回退到指定版本
git checkout v0.2.0
bun run build
# 重新部署 Web 端
# 或重新发布终端端
```

### 13.8 CI/CD 集成（推荐）

建议后续添加 GitHub Actions 自动化：

```yaml
# .github/workflows/release.yml（建议配置）
# 触发: git tag push (v*)
# 步骤: lint → typecheck → build → publish terminal → deploy web
```
