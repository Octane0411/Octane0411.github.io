import { visit } from 'unist-util-visit'

export function rehypeCodeBlock() {
  return (tree: any) => {
    visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
      if (
        node.tagName === 'pre' &&
        node.children[0]?.type === 'element' &&
        node.children[0]?.tagName === 'code'
      ) {
        const codeNode = node.children[0]
        const className = codeNode.properties?.className?.[0] || ''

        // Skip mermaid code blocks
        if (className.includes('language-mermaid')) {
          return
        }

        // Extract language from className (e.g., "language-javascript" -> "javascript")
        const language = className.replace('language-', '') || 'text'

        // Extract code content - handle multiple text nodes
        let code = ''
        if (codeNode.children) {
          for (const child of codeNode.children) {
            if (child.type === 'text') {
              code += child.value
            } else if (child.type === 'element' && child.tagName === 'span') {
              // Handle inline elements within code
              for (const spanChild of child.children || []) {
                if (spanChild.type === 'text') {
                  code += spanChild.value
                }
              }
            }
          }
        }

        // Replace with CodeBlock component
        const codeBlockNode = {
          type: 'element',
          tagName: 'CodeBlock',
          properties: { code, language },
          children: [],
        }

        if (parent && typeof index === 'number') {
          parent.children[index] = codeBlockNode
        }
      }
    })
  }
}
