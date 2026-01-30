export interface CodeBlock {
  language: string
  code: string
  startIndex: number
  endIndex: number
}

export function extractCodeBlocks(content: string): CodeBlock[] {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  const blocks: CodeBlock[] = []
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || "plaintext",
      code: match[2].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    })
  }

  return blocks
}

export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char])
}

export function parseInlineMarkdown(text: string): string {
  let result = escapeHtml(text)

  // Bold
  result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Italic
  result = result.replace(/\*(.*?)\*/g, "<em>$1</em>")

  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>'
  )

  return result
}
