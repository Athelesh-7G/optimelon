"use client"

import React from "react"
import { useState, useCallback, useMemo } from "react"
import { Check, Copy, User } from "lucide-react"
import { extractCodeBlocks, parseInlineMarkdown } from "@/lib/markdown"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="my-3 rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="flex items-center justify-between bg-secondary/80 px-4 py-2 text-sm">
        <span className="text-muted-foreground font-mono text-xs">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto bg-secondary/30 p-4">
        <code className="text-sm font-mono text-foreground leading-relaxed">{code}</code>
      </pre>
    </div>
  )
}

function renderContent(content: string) {
  const codeBlocks = extractCodeBlocks(content)

  if (codeBlocks.length === 0) {
    const paragraphs = content.split(/\n\n+/)
    return paragraphs.map((para, i) => {
      const lines = para.split("\n")
      return (
        <p key={i} className="mb-3 last:mb-0 leading-relaxed">
          {lines.map((line, j) => (
            <span key={j}>
              <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }} />
              {j < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      )
    })
  }

  const elements: React.ReactNode[] = []
  let lastIndex = 0

  codeBlocks.forEach((block, index) => {
    if (block.startIndex > lastIndex) {
      const textBefore = content.slice(lastIndex, block.startIndex).trim()
      if (textBefore) {
        const paragraphs = textBefore.split(/\n\n+/)
        paragraphs.forEach((para, i) => {
          const lines = para.split("\n")
          elements.push(
            <p key={`text-${index}-${i}`} className="mb-3 leading-relaxed">
              {lines.map((line, j) => (
                <span key={j}>
                  <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }} />
                  {j < lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          )
        })
      }
    }

    elements.push(<CodeBlock key={`code-${index}`} language={block.language} code={block.code} />)
    lastIndex = block.endIndex
  })

  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex).trim()
    if (textAfter) {
      const paragraphs = textAfter.split(/\n\n+/)
      paragraphs.forEach((para, i) => {
        const lines = para.split("\n")
        elements.push(
          <p key={`text-end-${i}`} className="mb-3 last:mb-0 leading-relaxed">
            {lines.map((line, j) => (
              <span key={j}>
                <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }} />
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })
    }
  }

  return elements
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const renderedContent = useMemo(() => renderContent(content), [content])

  return (
    <div
      className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        role === "user" ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          role === "user"
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
            : "bg-gradient-to-br from-accent/20 to-accent/10 text-accent"
        }`}
      >
        {role === "user" ? (
          <User className="h-4 w-4" />
        ) : (
          <span className="text-sm" role="img" aria-label="assistant">🍉</span>
        )}
      </div>
      <div
        className={`flex-1 max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          role === "user"
            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto"
            : "bg-card border border-border"
        }`}
      >
        <div className={`prose prose-sm max-w-none ${role === "user" ? "prose-invert" : ""}`}>
          {renderedContent}
        </div>
      </div>
    </div>
  )
}
