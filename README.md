# Octane's Website

个人站点与技术博客。极简 editorial 风格，内置 GEO（生成式引擎优化）基建。
基于 [Astro](https://astro.build) + Tailwind v4，部署到 GitHub Pages。

线上地址：https://octane0411.github.io

## 技术栈

- **Astro 6** — 内容优先、默认零 JS、SEO 友好
- **Tailwind CSS v4**（PostCSS 接入）+ `@tailwindcss/typography`
- **Content Collections**（`src/content/blog/`，Markdown / MDX）
- 自托管变量字体：Newsreader（衬线标题）+ Inter（无衬线正文）

## 命令

```bash
npm install        # 安装依赖
npm run dev        # 本地开发 http://localhost:4321
npm run build      # 生产构建到 dist/
npm run preview    # 预览构建产物
```

## 写文章

在 `src/content/blog/` 新建 `your-slug.md`，frontmatter 如下：

```md
---
title: 文章标题
description: 1-2 句自包含的摘要（同时用作 meta、JSON-LD 和 llms.txt，也是 GEO 的“答案块”，建议 40-80 字）
date: 2026-06-11
updated: 2026-06-12        # 可选；刷新内容时更新，AI 引擎看重新鲜度
tags: [Claude Code, Agent]
draft: false               # true 则不发布
tldr:                      # 可选；渲染成 TL;DR 区块，也利于被 AI 抽取
  - 第一个要点
  - 第二个要点
---

正文从这里开始（不要再写一级标题 H1，标题由页面渲染）。
```

文件名即 URL slug：`src/content/blog/foo.md` → `/blog/foo/`。

## GEO（生成式引擎优化）内建

- `public/robots.txt`：放行 GPTBot / ClaudeBot / PerplexityBot / Google-Extended 等 AI 爬虫
- 每篇文章自动注入 `BlogPosting` + `BreadcrumbList` JSON-LD；首页注入 `Person` + `WebSite`
- `/llms.txt`：按 [llmstxt.org](https://llmstxt.org) 规范自动生成的站点索引
- 每篇文章的 **Markdown twin**：在原文 URL 后加 `.md`（如 `/blog/foo.md`）供 AI 直接读取
- 自动生成 `sitemap-index.xml` 与 `/rss.xml`

### 写作时的 GEO 习惯（脚手架管不了，靠你）

- **Answer-first**：每个 `##` 标题下先写一段 40-60 字的直接回答
- **问句式标题**：用「如何做 X？」「X 和 Y 的区别？」匹配真实提问
- **自包含段落**：每段当作可能被单独抽走来写
- **事实密度**：用具体数字、具名来源、版本号代替模糊表述
- 重要文章每 60-90 天回顾更新一次，并更新 `updated` 字段

## 精选项目的 star 数

首页与 About 的精选项目 star 数在**构建时从 GitHub API 实时拉取**
（`src/lib/github.ts`），失败时回退到 `consts.ts` 里的 `fallbackStars`。
本地匿名请求即可；CI 通过 `GITHUB_TOKEN` 提升限额。要增删项目，改 `PROJECTS` 即可。

## 部署

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）自动构建并发布。

> 首次需在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
