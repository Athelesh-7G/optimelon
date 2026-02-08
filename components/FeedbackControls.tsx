"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react"
import styles from "./FeedbackControls.module.css"
import ShareButton from "./ShareButton"

interface FeedbackControlsProps {
  messageId: string
  modelUsed?: string
  routingConfidence?: number
  onUpdate?: (messageId: string, feedback: "up" | "down" | null) => void
}

export default function FeedbackControls({
  messageId,
  onUpdate,
}: FeedbackControlsProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)
  const [copied, setCopied] = useState(false)
  const [isGuarded, setIsGuarded] = useState(false)

  const messageElement = useMemo(
    () => (typeof document !== "undefined" ? document.querySelector(`[data-message-id="${messageId}"]`) : null),
    [messageId]
  )

  useEffect(() => {
    if (!messageElement) return
    const existing = messageElement.getAttribute("data-message-feedback")
    if (existing === "up" || existing === "down") {
      setFeedback(existing)
    }
  }, [messageElement])

  const getMessageContent = useCallback(() => {
    if (!messageElement) return ""
    return messageElement.getAttribute("data-message-content") || ""
  }, [messageElement])

  const handleCopy = useCallback(async () => {
    const content = getMessageContent()
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [getMessageContent])

  const handleToggle = useCallback(
    (value: "up" | "down") => {
      if (isGuarded) return
      setIsGuarded(true)
      const nextValue = feedback === value ? null : value
      setFeedback(nextValue)
      onUpdate?.(messageId, nextValue)
      setTimeout(() => setIsGuarded(false), 0)
    },
    [feedback, isGuarded, messageId, onUpdate]
  )

  return (
    <div className={styles.controls}>
      <button
        type="button"
        onClick={handleCopy}
        className={`${styles.iconButton} ${copied ? styles.copied : ""}`}
        aria-label={copied ? "Copied" : "Copy response"}
        title={copied ? "Copied" : "Copy response"}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <button
        type="button"
        aria-label="Thumbs up"
        title="Thumbs up"
        className={`${styles.iconButton} ${feedback === "up" ? styles.active : ""}`}
        onClick={() => handleToggle("up")}
      >
        <ThumbsUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Thumbs down"
        title="Thumbs down"
        className={`${styles.iconButton} ${feedback === "down" ? styles.active : ""}`}
        onClick={() => handleToggle("down")}
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
      <ShareButton textToShare={getMessageContent()} />
    </div>
  )
}
