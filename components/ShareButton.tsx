"use client"

import React, { useCallback, useState } from "react"
import { Share2 } from "lucide-react"
import styles from "./FeedbackControls.module.css"

interface ShareButtonProps {
  textToShare?: string
  imageUrl?: string
}

export default function ShareButton({ textToShare, imageUrl }: ShareButtonProps) {
  const [hasShared, setHasShared] = useState(false)

  const handleShare = useCallback(async () => {
    const fallbackText = textToShare || imageUrl || window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: "OptiMelon",
          text: textToShare,
          url: window.location.href,
        })
        console.log("shared via native share", fallbackText)
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fallbackText)
        console.log("copied to clipboard as fallback", fallbackText)
      } else {
        console.log("share fallback unavailable")
      }
      setHasShared(true)
      setTimeout(() => setHasShared(false), 1500)
    } catch (error) {
      console.error("share failed", error)
      try {
        await navigator.clipboard.writeText(fallbackText)
        console.log("copied fallback", fallbackText)
      } catch (fallbackError) {
        console.error("clipboard fallback failed", fallbackError)
      }
    }
  }, [imageUrl, textToShare])

  return (
    <button
      type="button"
      aria-label="Share"
      title={hasShared ? "Copied!" : "Share"}
      onClick={handleShare}
      className={styles.iconButton}
    >
      <Share2 className="h-4 w-4" />
    </button>
  )
}
