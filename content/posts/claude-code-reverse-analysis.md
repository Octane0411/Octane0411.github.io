---
title: Claude Code 逆向工程深度解析
description: 基于Yuyz0112/claude-code-reverse项目的深度学习总结
date: 2025-11-05
tags: [Claude Code, 逆向工程, Agent系统, 智能体架构]
---

# Claude Code 逆向工程深度解析

> 基于 [Yuyz0112/claude-code-reverse](https://github.com/Yuyz0112/claude-code-reverse) 项目的深度学习总结。

## 1. 项目概述

该项目旨在通过动态分析的方式逆向工程 Anthropic 发布的 Claude Code 工具。作者提出了一种 "v2" 方案，即通过 Monkey Patch（猴子补丁）的方式拦截 Claude Code 与 LLM API 的交互，从而获取其内部的工作流程、Prompt 设计以及工具定义。

## 2. 逆向方法论

### 2.1 核心思路
Claude Code 本质上是一个复杂的 Agent 系统，最终必须通过 API 与 LLM 进行交互。因此，忽略内部复杂的业务逻辑，直接捕获最终发送给 LLM 的 Request 和 LLM 返回的 Response，是理解其行为最直接的方式。

### 2.2 技术实现
1.  **定位代码**：找到 Claude Code 安装后的 `cli.js` 文件。
2.  **代码美化**：使用 `js-beautify` 格式化混淆后的代码。
3.  **Monkey Patch**：
    *   Claude Code 使用 Anthropic 官方 TS SDK (`beta.messages.create`) 发送请求。
    *   通过修改 `cli.js`，拦截 `beta.messages.create` 方法。
    *   **日志记录**：在请求发出前记录 `input` (params)，在请求返回（包括流式返回）后记录 `output`。
    *   日志保存在 `messages.log` 中。
4.  **可视化分析**：
    *   使用 `parser.js` 解析原始日志，结构化提取会话信息。
    *   使用 `visualize.html` 可视化展示对话流，辅助分析 Prompt 和 Tool 使用情况。

## 3. Claude Code 架构与核心流程

通过逆向分析，揭示了 Claude Code 的多个核心模块和工作流程：

### 3.1 模型选择策略
Claude Code 根据任务难度采用了分层模型策略：
*   **Claude 3.5 Haiku**：用于轻量级任务，如 Quota 查询、Topic 检测、历史对话总结。
*   **Claude 3.7 Sonnet** (推测为 Sonnet 4 或高智商版本)：用于核心 Agent 流程、上下文压缩等复杂任务。

### 3.2 核心功能模块

#### A. Quota 查询
*   **触发时机**：每次启动时。
*   **行为**：发送简短文本 `quota`，用于检测 API 配额是否充足。
*   **模型**：Haiku 3.5。

#### B. Topic 检测
*   **触发时机**：每次用户输入时。
*   **行为**：判断当前输入是否开启了一个新的话题（Topic）。主要用于更新终端标题。
*   **Prompt**：`check-new-topic.prompt.md`
*   **模型**：Haiku 3.5。

#### C. 核心 Agent 流程 (Main Loop)
*   **行为**：这是 Claude Code 的主循环。在 Context 充足时，不断追加消息。
*   **Prompt**：
    *   `system-workflow.prompt.md`：定义了 Agent 的核心工作流、工具使用规范、任务管理等。
    *   `system-reminder-start.prompt.md`：动态加载环境信息。
    *   `system-reminder-end.prompt.md`：检测并加载 Todo 短时记忆，确保模型不"忘事"。
*   **模型**：Sonnet 4。

#### D. 上下文压缩 (Compact)
*   **触发时机**：Context 长度不足或手动触发。
*   **行为**：将当前冗长的对话历史压缩为一个精简的文本摘要，作为新对话的 Context。
*   **Prompt**：
    *   `system-compact.prompt.md`：System Prompt。
    *   `compact.prompt.md`：指导 LLM 进行压缩的具体指令。
*   **模型**：Sonnet 4。

#### E. 记忆管理 (Todo System)
*   **机制**：基于工具的短时记忆。
*   **工具**：`TodoWrite` 和 `TodoRead`。
*   **实现**：
    *   Agent 将待办事项写入 `~/.claude/todos/` 下的 JSON 文件。
    *   在 `system-reminder-end` 阶段，系统会读取最新的 Todo 列表注入到 Prompt 中。
    *   这使得 Agent 能够跨多轮对话保持任务进度感知。

#### F. 子智能体 (Sub-Agent / Task)
*   **机制**：通过 `Task` 工具实现的多 Agent 架构。
*   **行为**：
    1.  Main Agent 决定需要执行独立任务（如"搜索代码库"）。
    2.  调用 `Task` 工具，传入任务描述。
    3.  系统启动一个 Sub-Agent，从 Main Context 提取相关信息作为 Sub Context 的初始 Prompt。
    4.  Sub-Agent 独立执行，产生大量中间过程（"脏上下文"）。
    5.  Sub-Agent 完成后，只将最终结果返回给 Main Agent。
*   **优势**：有效隔离上下文，防止 Main Context 被无关的搜索/调试过程污染。

#### G. IDE 集成
*   **行为**：读取 IDE 中打开的文件，提供额外的上下文。
*   **Prompt**：`ide-opened-file.prompt.md`。
*   **工具**：通过 MCP (Model Context Protocol) 注册 IDE 专用工具（如获取 Lint 错误）。

#### H. 历史总结
*   **触发时机**：启动时。
*   **行为**：对过往对话进行总结。
*   **Prompt**：`summarize-previous-conversation.prompt.md`。
*   **模型**：Haiku 3.5。

## 4. 关键资源清单

### 4.1 提取的 Prompts
位于 `results/prompts/` 目录：
*   `system-identity.prompt.md`: 身份定义。
*   `system-workflow.prompt.md`: 核心工作流。
*   `check-new-topic.prompt.md`: 话题检测。
*   `compact.prompt.md` / `system-compact.prompt.md`: 上下文压缩。
*   `summarize-previous-conversation.prompt.md`: 会话总结。
*   `system-reminder-start.prompt.md` / `system-reminder-end.prompt.md`: 动态提醒与记忆注入。
*   `ide-opened-file.prompt.md`: IDE 上下文注入。
*   `check-active-git-files.prompt.md`: Git 文件检查。
*   `system-output-style-explanatory.prompt.md` / `system-output-style-learning.prompt.md`: 输出风格控制。

### 4.2 提取的 Tools
位于 `results/tools/` 目录：
*   **文件操作**: `Read`, `Write`, `Edit`, `MultiEdit`, `Ls`, `Glob`, `Grep`
*   **任务管理**: `TodoWrite`, `Task` (Sub-Agent), `ExitPlanMode`
*   **网络**: `WebFetch`, `WebSearch`
*   **执行**: `Bash`
*   **Notebook**: `NotebookRead`, `NotebookEdit`

## 5. 总结
Claude Code 的强大之处在于其精细的 **Prompt Engineering** 和 **架构设计**：
1.  **分层模型**：在成本和智力之间取得平衡。
2.  **上下文隔离**：利用 Sub-Agent 机制保持主上下文的纯净。
3.  **显式记忆**：通过 Todo 工具显式管理任务状态，而非完全依赖隐式 Context。
4.  **动态注入**：利用 System Reminder 动态注入环境和记忆信息。

该逆向工程项目为我们学习顶级 Agent 的设计模式提供了宝贵的实战素材。
