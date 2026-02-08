"use client"

import React from "react"

interface FeedbackButtonsProps {
  selected?: "up" | "down"
  disabled?: boolean
  onSelect: (value: "up" | "down") => void
}

export function FeedbackButtons({ selected, disabled = false, onSelect }: FeedbackButtonsProps) {
  const baseClasses =
    "p-1.5 rounded-md transition-all duration-200 bg-secondary hover:bg-secondary/80 text-muted-foreground"
  const selectedClasses = "bg-primary/10 text-primary border border-primary/20"
  const disabledClasses = "opacity-60 cursor-not-allowed hover:scale-100"

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <button
        type="button"
        onClick={() => onSelect("up")}
        disabled={disabled}
        className={`${baseClasses} hover:scale-105 ${selected === "up" ? selectedClasses : ""} ${disabled ? disabledClasses : ""}`}
        aria-pressed={selected === "up"}
        aria-label="Thumbs up"
        title="Thumbs up"
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => onSelect("down")}
        disabled={disabled}
        className={`${baseClasses} hover:scale-105 ${selected === "down" ? selectedClasses : ""} ${disabled ? disabledClasses : ""}`}
        aria-pressed={selected === "down"}
        aria-label="Thumbs down"
        title="Thumbs down"
      >
        👎
      </button>
    </div>
  )
}
