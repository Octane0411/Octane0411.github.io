import { getPostsByTag, getAllTags } from "@/lib/posts"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({
    tag: tag,
  }))
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const posts = getPostsByTag(tag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回首页
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-8">
        标签: {tag}
      </h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="p-6 border rounded-lg hover:border-primary/50 transition-colors"
          >
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-semibold mb-3 hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {post.summary}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time>{formatDate(post.date)}</time>
                <span>·</span>
                <span>{post.readingTime} 分钟阅读</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
