'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { highlighter } from '@/lib/shiki'

interface CodeBlockProps {
  code: string
  language: string
  filename?: string
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const highlight = async () => {
      const h = await highlighter.codeToHtml(code, {
        lang: language,
        theme: 'github-dark',
      })
      setHtml(h)
    }
    highlight()
  }, [code, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
