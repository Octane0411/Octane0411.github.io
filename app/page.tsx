import { getAllPosts, getAllTags } from "@/lib/posts"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function HomePage() {
  const posts = getAllPosts()
  const tags = getAllTags()

  return (
    <div className="max-w-4xl mx-auto">
      <section className="mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Octane&apos;s Blog
        </h1>
        <p className="text-xl text-muted-foreground">
          探索技术，记录成长
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">标签</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">文章</h2>
        <div className="space-y-8">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">暂无文章</p>
          ) : (
            posts.map((post) => (
              <article
                key={post.slug}
                className="group p-6 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.summary}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <time>{formatDate(post.date)}</time>
                    <span>·</span>
                    <span>{post.readingTime} 分钟阅读</span>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-muted rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
