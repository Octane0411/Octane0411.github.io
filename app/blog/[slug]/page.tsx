import { getPostBySlug, getAllPosts } from "@/lib/posts"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { CodeBlock as CodeBlockComponent } from "@/components/code-block"
import { rehypeMermaid } from "@/lib/rehype-mermaid"
import { rehypeCodeBlock } from "@/lib/rehype-code-block"

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        ← 返回首页
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <time>{formatDate(post.date)}</time>
          <span>·</span>
          <span>{post.readingTime} 分钟阅读</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="px-2.5 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              rehypePlugins: [rehypeCodeBlock, rehypeMermaid],
            },
          }}
          components={{
            Mermaid: MermaidDiagram,
            CodeBlock: CodeBlockComponent,
          }}
        />
      </div>
    </article>
  )
}
