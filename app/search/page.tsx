import { getAllPosts } from "@/lib/posts"
import { SearchClient } from "./_client"

export default function SearchPage() {
  const allPosts = getAllPosts()

  return <SearchClient allPosts={allPosts} />
}
