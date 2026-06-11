import { getCollection } from "astro:content";
import { SITE } from "@/consts";

// "Markdown twins": a clean .md version of every post at /blog/<slug>.md so AI
// crawlers can ingest the raw content without parsing HTML.
export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

export async function GET({ props }: { props: { entry: any } }) {
  const { entry } = props;
  const d = entry.data;
  const fm = [
    `# ${d.title}`,
    "",
    `> ${d.description}`,
    "",
    `*${d.date.toISOString().slice(0, 10)} · ${SITE.author} · ${SITE.url}/blog/${entry.id}/*`,
    "",
    "---",
    "",
    entry.body ?? "",
  ].join("\n");

  return new Response(fm, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
