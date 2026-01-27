---
title: OpenCode 高级运行时系统设计
description: Background Agent和Preemptive Compaction在Agent运行时的应用
date: 2025-11-26
tags: [OpenCode, 运行时系统, Background Agent, 上下文管理]
---

# 深入 OhMyOpenCode：打造 Agent 的高级运行时 (Advanced Runtime)

在上一篇文章中，我们探讨了 OpenCode 和 OhMyOpenCode 在 Agent 编排层面的不同设计。今天，我们将深入挖掘 `oh-my-opencode` 另外两个"黑科技"功能：**Background Agent (后台智能体)** 和 **Preemptive Compaction (抢占式压缩)**。

这两个功能实际上是在 OpenCode 基础能力之上，构建了一套**高级运行时 (Advanced Runtime)**，解决了 Agent 在实际工程落地中面临的"单线程阻塞"和"上下文爆炸"两大痛点。

## 1. Background Agent：从单线程到异步并发

默认情况下，与 Agent 的对话是同步且阻塞的：你发送一个指令，等待 Agent 思考、执行工具、返回结果，然后你才能进行下一步。这在处理耗时任务（如运行测试、全库重构、长文档分析）时效率极低。

`oh-my-opencode` 引入了 **Background Agent**，允许你在当前会话中派发一个任务到后台异步执行，而不阻塞主会话。

### 核心机制解析

它的实现位于 `src/features/background-agent/`，主要包含以下几个关键设计：

#### A. 独立会话隔离 (Isolated Session)
当你启动一个后台任务时，它实际上是调用 `client.session.create` 创建了一个全新的、独立的 Session。这意味着后台任务拥有自己独立的上下文，不会污染当前的主会话。

```typescript
// src/features/background-agent/manager.ts
const createResult = await this.client.session.create({
  body: {
    parentID: input.parentSessionID, // 关联父 session ID
    title: `Background: ${input.description}`,
  },
});
```

#### B. 跨会话通知 (Cross-Session Notification)
这是最"魔法"的地方。当后台任务完成时，它会**反向操作**，主动向你的**父会话**发送一条消息（Prompt），告诉你任务完成了。

```typescript
// 任务完成后，向父 session 发送通知
await this.client.session.prompt({
  path: { id: task.parentSessionID },
  body: {
    parts: [{ 
      type: "text", 
      text: `[BACKGROUND TASK COMPLETED] Task "${task.description}" finished...` 
    }],
  },
});
```
这就好比你在终端里跑了一个 `nohup` 命令，然后继续干别的，等它跑完了自动弹出一个 Toast 通知你。

#### C. 并发控制 (Concurrency Manager)
为了防止后台任务过多导致 API Rate Limit 耗尽，它实现了一个简单的信号量机制。你可以配置针对不同 Model 或 Provider 的并发限制（默认通常为 5）。

## 2. Preemptive Compaction：自动化的上下文垃圾回收

在长对话或复杂 Agent 任务（如 Sisyphus 循环）中，Context Window (上下文窗口) 很容易耗尽。通常 OpenCode 会报错，然后强迫用户手动执行 `/compact`。

**Preemptive Compaction (抢占式压缩)** 通过 Hook 实时监控 Token 使用率，实现了自动化的上下文管理。

### 工作流程

代码位于 `src/hooks/preemptive-compaction/`：

1.  **实时监控**: 每次 Assistant 回复后，Hook 会计算当前的 Token 使用率 (`usageRatio = totalUsed / contextLimit`)。
2.  **阈值触发**: 一旦超过设定的阈值（例如 80%），触发压缩流程。
3.  **无感压缩**: 自动调用 `client.session.summarize` 将历史对话压缩为摘要。
4.  **自动恢复**: 压缩完成后，自动发送一个 "Continue" 的 Prompt，让 Agent 继续刚才的工作。

```typescript
// src/hooks/preemptive-compaction/index.ts (简化逻辑)

if (usageRatio < threshold) return;

// 1. 提示用户
await ctx.client.tui.showToast({ title: "Preemptive Compaction", ... });

// 2. 执行压缩
await ctx.client.session.summarize({ ... });

// 3. 自动恢复执行 (Resume)
await ctx.client.session.promptAsync({
  body: { parts: [{ type: "text", text: "Continue" }] },
});
```

这种机制保证了 Agent 可以在一个 Session 中持续运行数小时甚至数天，而不会因为上下文溢出而中断，对于实现**自主循环 (Ralph Loop)** 至关重要。

## 3. 总结：从 Chatbot 到 Autonomous Worker

`oh-my-opencode` 不仅仅是一个简单的插件集合，它通过以下三个核心特性，将 OpenCode 从一个"问答机器人"进化成了一个能独立干活、自我管理、长期运行的"智能员工"：

1.  **Ralph Loop**: 赋予 Agent **自主循环**的能力，使其能处理多步骤长程任务。
2.  **Background Agent**: 赋予 Agent **并行处理**的能力，实现任务的异步化。
3.  **Preemptive Compaction**: 赋予 Agent **资源管理**的能力，保证系统的长期稳定性。

这些设计思路对于我们开发自己的 Agent 系统或 OpenCode 插件具有极高的参考价值。
