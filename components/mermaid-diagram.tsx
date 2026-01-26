'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import mermaid from 'mermaid'
import { X } from 'lucide-react'

interface MermaidDiagramProps {
  diagram?: string
}

export function MermaidDiagram({ diagram = '' }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const diagramId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !diagram || diagram.trim() === '') {
      if (!diagram || diagram.trim() === '') {
        setError('Empty diagram')
      }
      return
    }

    const mermaidTheme = resolvedTheme === 'dark' || theme === 'dark' ? 'dark' : 'default'

    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'loose',
    })

    const renderDiagram = async () => {
      try {
        // Generate new ID to avoid conflicts when re-rendering
        const newId = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        diagramId.current = newId
        const { svg } = await mermaid.render(newId, diagram.trim())
        setSvg(svg)
        setError('')
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError('Failed to render diagram. Please check syntax.')
      }
    }

    renderDiagram()
  }, [diagram, theme, resolvedTheme, mounted])

  const handleOpenModal = () => {
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = ''
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal()
    }
  }

  if (!mounted) {
    return (
      <div className="my-6 p-4 border rounded-lg bg-muted flex items-center justify-center">
        <div className="animate-pulse bg-muted-foreground/20 h-32 w-full rounded" />
      </div>
    )
  }

  if (!diagram || diagram.trim() === '') {
    return (
      <div className="my-6 p-4 border rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Empty diagram</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-6 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="my-6 p-4 border rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading diagram...</p>
      </div>
    )
  }

  return (
    <>
      <div className="my-6 flex justify-center">
        <button
          onClick={handleOpenModal}
          className="max-w-full overflow-x-auto cursor-zoom-in hover:opacity-80 transition-opacity"
          aria-label="Click to enlarge diagram"
        >
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        </button>
      </div>

      {/* Modal for zoomed diagram */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-200"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-card rounded-lg shadow-2xl max-w-5xl max-h-[90vh] overflow-auto p-6">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-md bg-muted hover:bg-muted-foreground/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div
              dangerouslySetInnerHTML={{ __html: svg }}
              className="mermaid-zoomed"
            />
          </div>
        </div>
      )}
    </>
  )
}
