"use client"

import { useState, useMemo } from "react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Search as SearchIcon } from "lucide-react"
import Fuse from "fuse.js"
import type { Post } from "@/lib/posts"

interface SearchClientProps {
  allPosts: Post[]
}

export function SearchClient({ allPosts }: SearchClientProps) {
  const [query, setQuery] = useState("")

  const fuse = useMemo(() => {
    return new Fuse(allPosts, {
      keys: ["title", "summary", "tags"],
      threshold: 0.3,
    })
  }, [allPosts])

  const results = useMemo(() => {
    if (!query.trim()) {
      return allPosts
    }
    return fuse.search(query).map((result) => result.item)
  }, [query, fuse, allPosts])

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

      <h1 className="text-3xl font-bold tracking-tight mb-8">搜索文章</h1>

      <div className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题、摘要或标签..."
            className="w-full pl-10 pr-4 py-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-6">
        {results.length === 0 ? (
          <p className="text-muted-foreground">
            {query ? "未找到匹配的文章" : "暂无文章"}
          </p>
        ) : (
          results.map((post) => (
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
    </div>
  )
}
