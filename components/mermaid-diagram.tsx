'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  diagram?: string
}

export function MermaidDiagram({ diagram = '' }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const diagramId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    // Skip if diagram is empty
    if (!diagram || diagram.trim() === '') {
      setError('Empty diagram')
      return
    }

    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    })

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(diagramId.current, diagram.trim())
        setSvg(svg)
        setError('')
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError('Failed to render diagram. Please check syntax.')
      }
    }

    renderDiagram()
  }, [diagram])

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
    <div className="my-6 flex justify-center">
      <div
        dangerouslySetInnerHTML={{ __html: svg }}
        className="max-w-full overflow-x-auto"
      />
    </div>
  )
}
