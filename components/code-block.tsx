'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useTheme } from 'next-themes'
import { highlighter } from '@/lib/shiki'
import type { ShikiTransformer } from 'shiki'

interface CodeBlockProps {
  code: string
  language: string
  filename?: string
  showLineNumbers?: boolean
}

/**
 * Custom transformer to add line numbers to each line in the code block.
 */
const lineNumbersTransformer: (show: boolean) => ShikiTransformer =
  (show) => ({
    name: 'line-numbers',
    line(hast, line) {
      if (!show) return

      const lineNumber = String(line)
      const lineElement = hast

      // Add data-line attribute for CSS styling
      lineElement.properties = lineElement.properties || {}
      lineElement.properties['data-line'] = lineNumber

      // Add line number span at beginning
      const lineNumberSpan = {
        type: 'element' as const,
        tagName: 'span',
        properties: {
          className: ['line-number'],
        },
        children: [
          {
            type: 'text' as const,
            value: lineNumber,
          },
        ],
      }

      // Prepend line number to the line
      lineElement.children = [lineNumberSpan, ...(lineElement.children || [])]
    },
  })

export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const highlight = async () => {
      const currentTheme =
        resolvedTheme === 'dark' || theme === 'dark'
          ? 'github-dark'
          : 'github-light'

      const h = await highlighter.codeToHtml(code, {
        lang: language,
        theme: currentTheme,
        transformers: [lineNumbersTransformer(showLineNumbers)],
      })
      setHtml(h)
    }
    highlight()
  }, [code, language, theme, resolvedTheme, mounted, showLineNumbers])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="relative group my-6 rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
          <span className="text-xs font-mono text-muted-foreground">
            {filename || language}
          </span>
          <button className="p-1.5 rounded-md">
            <Copy className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4">
          <div className="animate-pulse bg-muted h-4 rounded mb-2 w-full" />
          <div className="animate-pulse bg-muted h-4 rounded mb-2 w-3/4" />
          <div className="animate-pulse bg-muted h-4 rounded w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative group my-6 rounded-lg border bg-card overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
        <span className="text-xs font-mono text-muted-foreground">
          {filename || language}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-muted-foreground/10 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
      {/* Code content */}
      <div
        className="overflow-x-auto p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
