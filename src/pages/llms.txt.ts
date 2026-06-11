import { getCollection } from "astro:content";
import { SITE } from "@/consts";

// Generates /llms.txt per the llmstxt.org convention: a curated, machine
// -readable index pointing AI crawlers at the highest-value pages.
export async function GET() {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const lines: string[] = [];
  lines.push(`# ${SITE.title}`);
  lines.push("");
  lines.push(`> ${SITE.description}`);
  lines.push("");
  lines.push(
    "本站聚焦 AI coding agents（Claude Code、Codex、OpenCode）的架构与实现剖析。每篇文章都提供纯 Markdown 版本（在原文 URL 后加 `.md`）。",
  );
  lines.push("");
  lines.push("## Writing");
  for (const post of posts) {
    const url = `${SITE.url}/blog/${post.id}/`;
    lines.push(`- [${post.data.title}](${url}): ${post.data.description}`);
  }
  lines.push("");
  lines.push("## Optional");
  lines.push(`- [About](${SITE.url}/about/): 关于作者 Octane。`);
  lines.push(`- [RSS](${SITE.url}/rss.xml): 全文订阅源。`);

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
