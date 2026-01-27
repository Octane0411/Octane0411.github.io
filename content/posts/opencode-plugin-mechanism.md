---
title: OpenCode 插件机制深度解析
description: OpenCode插件系统的设计和开发实现指南
date: 2025-12-10
tags: [OpenCode, 插件系统, 扩展机制, 钩子设计]
---

# OpenCode 插件机制深度解析

本文档基于 OpenCode 源码（`packages/plugin`）及官方文档，深度解析 OpenCode 的插件机制，帮助开发者理解如何创建、开发和发布插件。

## 1. 插件的核心概念

OpenCode 的插件本质上是一个 **函数**，它接收当前的上下文（`PluginInput`），并返回一组 **钩子（Hooks）**。

```typescript
export type Plugin = (input: PluginInput) => Promise<Hooks>
```

### 1.1 输入参数 (`PluginInput`)

插件初始化时，OpenCode 会传入以下核心对象：

*   `client`: OpenCode SDK 客户端实例。
*   `project`: 当前项目信息。
*   `directory`: 当前工作目录。
*   `worktree`: Git 工作树根目录。
*   `serverUrl`: OpenCode 服务端地址。
*   `$`: `BunShell` 实例，用于执行 Shell 命令。

### 1.2 输出钩子 (`Hooks`)

插件通过返回 `Hooks` 对象来介入 OpenCode 的生命周期。主要的钩子包括：

*   **事件监听**:
    *   `event`: 监听系统事件。
    *   `config`: **核心钩子**，读取或修改配置（包括注册新 Agent）。
*   **工具扩展**:
    *   `tool`: 注册自定义工具（Tool）。
*   **认证扩展**:
    *   `auth`: 注册新的认证提供商（如 OAuth）。
*   **聊天生命周期**:
    *   `chat.message`: 收到新消息时触发。
    *   `chat.params`: 修改发送给 LLM 的参数（如 temperature）。
    *   `experimental.chat.messages.transform`: **核心钩子**，在发送给 LLM 之前修改消息历史（可用于注入 System Prompt）。
    *   `experimental.chat.system.transform`: 修改 System Prompt。
*   **执行控制**:
    *   `command.execute.before`: 命令执行前拦截。
    *   `tool.execute.before` / `after`: 工具执行前后拦截。
    *   `permission.ask`: **核心钩子**，拦截权限请求（可用于自动授权）。

## 2. 开发环境搭建

OpenCode 插件使用 TypeScript 开发，推荐使用 Bun 作为运行时。

### 2.1 依赖包

插件开发主要依赖两个包：

1.  `@opencode-ai/plugin`: 提供插件系统的类型定义（`Plugin`, `Hooks` 等）。
2.  `@opencode-ai/sdk`: 提供核心数据结构（`Message`, `Project` 等）。

在 `package.json` 中，通常将它们声明为 `peerDependencies`，因为宿主环境（OpenCode）会提供这些包。

```json
{
  "peerDependencies": {
    "@opencode-ai/plugin": "^1.0.0",
    "@opencode-ai/sdk": "^1.0.0"
  },
  "devDependencies": {
    "bun-types": "latest",
    "typescript": "^5.0.0"
  }
}
```

### 2.2 项目结构

推荐的标准结构：

```
my-plugin/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts  <-- 入口文件，导出 Plugin 函数
    └── tool.ts   <-- 自定义工具定义
```

## 3. 核心场景实战

### 3.1 注册自定义工具

使用 `tool` 钩子注册新工具，供 LLM 调用。

```typescript
import { tool } from "@opencode-ai/plugin/tool"

export const MyPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      my_custom_tool: tool({
        description: "A custom tool description",
        args: {
          param: tool.schema.string()
        },
        async execute(args) {
          return `Executed with ${args.param}`;
        }
      })
    }
  }
}
```

### 3.2 注册新 Agent (通过 config 钩子)

OpenCode 允许插件通过 `config` 钩子动态修改配置，从而注册全新的 Agent，而不仅仅是覆盖现有的。

```typescript
"config": async (config) => {
  // 注入新 Agent
  config.agent = {
    ...(config.agent || {}),
    "my-new-agent": {
      name: "my-new-agent",
      mode: "primary", // 作为主 Agent 显示
      description: "A custom agent for specific tasks",
      prompt: "You are a specialized agent...",
      permission: {
        // 自定义权限
        edit: { "src/**/*.ts": "allow" }
      }
    }
  };
}
```

### 3.3 修改 System Prompt (实现新模式)

通过 `experimental.chat.messages.transform` 可以在消息发送给 LLM 前注入特定的指令，从而改变 LLM 的行为模式（例如实现 "OpenSpec Plan Mode"）。

```typescript
"experimental.chat.messages.transform": async (input, output) => {
  // 遍历消息，找到合适的插入点
  // 注入 <system-override> 指令
}
```

### 3.4 自动权限管理

通过 `permission.ask` 钩子，插件可以接管权限决策，实现特定场景下的自动授权。

```typescript
"permission.ask": async (input, output) => {
  if (input.permission === "file.write" && isSafeFile(input.metadata.filepath)) {
    output.status = "allow"; // 自动允许
  }
}
```

## 4. 总结

OpenCode 的插件系统非常灵活，通过丰富的钩子机制，开发者不仅可以添加工具，还能深入介入 LLM 的决策过程（Prompt 注入、参数调整）和执行过程（权限控制、命令拦截）。特别是 `config` 钩子，赋予了插件动态扩展系统能力（如新增 Agent）的强大权限。
