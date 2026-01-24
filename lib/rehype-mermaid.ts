import { visit } from 'unist-util-visit'

export function rehypeMermaid() {
  return (tree: any) => {
    visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
      if (
        node.tagName === 'pre' &&
        node.children[0]?.type === 'element' &&
        node.children[0]?.tagName === 'code' &&
        node.children[0]?.properties?.className?.[0]?.includes('language-mermaid')
      ) {
        const codeNode = node.children[0]

        // Extract code content - handle multiple text nodes
        let diagram = ''
        if (codeNode.children) {
          for (const child of codeNode.children) {
            if (child.type === 'text') {
              diagram += child.value
            } else if (child.type === 'element' && child.tagName === 'span') {
              // Handle inline elements within code
              for (const spanChild of child.children || []) {
                if (spanChild.type === 'text') {
                  diagram += spanChild.value
                }
              }
            }
          }
        }

        // Trim whitespace
        diagram = diagram.trim()

        // Replace with Mermaid component - pass diagram as property
        const mermaidNode = {
          type: 'element',
          tagName: 'Mermaid',
          properties: { diagram },
          children: [],
        }

        if (parent && typeof index === 'number') {
          parent.children[index] = mermaidNode
        }
      }
    })
  }
}
