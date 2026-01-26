import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Search, Home } from "lucide-react"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>首页</span>
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>搜索</span>
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
