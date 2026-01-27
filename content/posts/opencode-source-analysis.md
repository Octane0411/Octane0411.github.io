---
title: OpenCode Agent 源码深度解析
description: OpenCode从输入到代码生成的全流程分析
date: 2025-12-17
tags: [OpenCode, 源码分析, Session处理, Agent流程]
---

# OpenCode Agent 源码深度解析：从输入到代码生成的全流程

本文基于对 OpenCode 源码的深度研读，详细解析了其 Agent 系统的核心工作机制。从用户在 TUI 输入指令，到 LLM 生成代码，OpenCode 采用了一套严密的 Client-Server 架构来管理会话、上下文和工具执行。

## 1. 整体架构：Client-Server 模型

OpenCode 的架构分为前端（TUI/Client）和后端（Server）两部分。前端负责交互，后端负责核心逻辑。

### 核心流程
1.  **用户输入**：用户在 TUI 输入 Prompt。
2.  **请求发送**：SDK 将请求发送给 Hono Server。
3.  **会话处理**：Server 启动 `SessionProcessor`，这是 Agent 的核心循环。
4.  **LLM 交互**：Processor 构建上下文并调用 LLM。
5.  **工具执行**：如果 LLM 决定调用工具（如读取文件），Processor 执行工具并将结果回传给 LLM。
6.  **实时反馈**：所有状态变化通过 Server-Sent Events (SSE) 实时推送到前端。

### 关键代码入口
- **Client**: `packages/opencode/src/cli/cmd/tui/component/prompt/index.tsx` (处理用户输入)
- **Server**: `packages/opencode/src/server/server.ts` (处理 API 路由)

---

## 2. 核心大脑：Session Processor

`SessionProcessor` (`packages/opencode/src/session/processor.ts`) 是 Agent 的执行引擎。它在一个 `while(true)` 循环中运行，负责协调 LLM 的思考、工具调用和错误重试。

### 核心职责
- **自动重试**：处理 API 错误和网络波动。
- **流式解析**：解析 LLM 返回的 `text-delta` (文本)、`reasoning-delta` (思考) 和 `tool-call` (工具调用)。
- **死循环检测**：防止 Agent 反复执行相同的无效操作（"Doom Loop"）。
- **快照与结算**：在操作前后记录文件系统快照，计算 Token 消耗和成本。

### 状态流转逻辑

会话处理的状态机流程：

1. **开始 process**
2. **while true 循环**
3. **调用 LLM.stream**
4. **处理流事件** - 根据事件类型分流：
   - `text-delta`: 实时显示回复
   - `reasoning-delta`: 实时显示思考
   - `tool-call`: 检测死循环 & 执行工具
   - `start-step`: 记录文件快照
   - `finish-step`: 计算Token/成本 & 生成文件Diff
   - `error`: 可重试判断和处理

---

## 3. Prompt 工程：如何控制 LLM

OpenCode 如何让 LLM 知道它是谁、能做什么？答案在于 `packages/opencode/src/session/llm.ts` 中的 `stream` 函数。它负责拼装最终发给 LLM 的 System Prompt。

### System Prompt 的四层结构
最终的 Prompt 由以下四部分按顺序拼接而成：

1.  **Header (Provider 特定)**：针对特定模型（如 Anthropic）的特殊指令，用于优化表现或绕过限制。
2.  **Agent Prompt (人设)**：定义当前 Agent 的角色（如 "你是一个构建专家"）。如果 Agent 未定义，则使用 Provider 的默认 Prompt。
3.  **Environment (环境上下文)**：注入当前工作目录、操作系统、Git 分支、日期等动态信息。
4.  **Custom Rules (用户规则)**：读取项目根目录的 `AGENTS.md` 或 `.claude/CLAUDE.md`，允许用户自定义 Agent 行为。

### 拼装流程

Prompt Assembly 过程：

```
Header (Provider特定) 
     ↓
Agent Prompt / Provider Default
     ↓
Environment Info (cwd, os, date)
     ↓
Custom Rules (AGENTS.md)
     ↓
Final System Prompt → LLM Model
                    ↓
              Tools Definitions
              Params (Temp, TopP, MaxTokens)
                    ↓
              Output (Text / Tool Calls)
```

---

## 4. 工具系统：Agent 的手脚

Agent 的能力边界由工具决定。OpenCode 的工具系统包含定义、注册和注入三个环节。

### 工具定义与注册
所有工具在 `packages/opencode/src/tool/registry.ts` 中注册。
- **内置工具**：`BashTool` (执行命令), `ReadTool` (读文件), `EditTool` (改代码) 等。
- **插件工具**：支持动态加载外部插件提供的工具。

### 注入机制
在调用 LLM 之前，系统会通过 `resolveTools` 函数准备工具列表：
1.  **获取全量工具**：调用 `ToolRegistry.tools()`。
2.  **权限过滤**：根据当前 Agent 的 `permission` 配置，过滤掉被禁用的工具。
3.  **用户过滤**：如果用户在配置中显式禁用了某些工具，也会在此处移除。
4.  **注入**：过滤后的工具列表被传递给 AI SDK，最终作为 `tools` 参数发送给 LLM。

```typescript
// packages/opencode/src/session/llm.ts
async function resolveTools(input) {
  const disabled = PermissionNext.disabled(Object.keys(input.tools), input.agent.permission)
  for (const tool of Object.keys(input.tools)) {
    if (input.user.tools?.[tool] === false || disabled.has(tool)) {
      delete input.tools[tool]
    }
  }
  return input.tools
}
```

## 5. 总结

OpenCode 通过精细的 Prompt 拼装让 LLM 理解上下文，通过强大的 Session Processor 保证执行的稳定性，再配合灵活的工具系统赋予 LLM 操作代码库的能力。这套机制使得 Agent 不仅能"聊天"，更能真正地"干活"。
