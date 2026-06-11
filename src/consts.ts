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
