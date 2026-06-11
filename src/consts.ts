// Centralized site configuration. Used across SEO, JSON-LD, RSS and llms.txt.
export const SITE = {
  url: "https://octane0411.github.io",
  title: "Octane",
  // Keep this tight: it is reused verbatim in <meta>, JSON-LD and llms.txt.
  description:
    "Octane 的个人站点。深入剖析 AI coding agents（Claude Code、Codex、OpenCode）的架构与实现，以及构建开发者工具的实践。",
  author: "Octane",
  lang: "zh-CN",
  locale: "zh_CN",
} as const;

export const SOCIALS = {
  github: "https://github.com/Octane0411",
  // sameAs links strengthen entity authority for GEO. Add more as you create them.
  sameAs: ["https://github.com/Octane0411"],
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
] as const;

// One-line positioning used in the home hero.
export const TAGLINE =
  "Builder。为重度 code agent 用户打造工具，并深入剖析 AI coding agents 的架构与实现。";

// Featured open-source work. Single source of truth for home + about.
// `repo` (owner/name) drives the live star count fetched at build time;
// `fallbackStars` is used only if the GitHub API is unreachable.
export const PROJECTS = [
  {
    repo: "Octane0411/open-vibe-island",
    name: "open-vibe-island",
    desc: "为重度 code agent 用户设计的 macOS 工具，open vibe-island 的开源替代品。支持 cc / codex / opencode，terminal / ghostty / cmux / kaku / iterm。",
    lang: "Swift",
    fallbackStars: 1358,
    href: "https://github.com/Octane0411/open-vibe-island",
  },
  {
    repo: "Octane0411/opencode-plugin-openspec",
    name: "opencode-plugin-openspec",
    desc: "OpenCode 插件，集成 OpenSpec，新增专用的 openspec-plan 模式用于创建与编辑 spec 文件。",
    lang: "TypeScript",
    fallbackStars: 120,
    href: "https://github.com/Octane0411/opencode-plugin-openspec",
  },
] as const;

export const FOCUS = [
  "AI coding agents 架构剖析",
  "Claude Code",
  "Codex",
  "OpenCode",
  "开发者工具",
  "macOS 原生体验",
] as const;
