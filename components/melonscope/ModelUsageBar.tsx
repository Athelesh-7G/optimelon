"use client"

import React from "react"

interface ModelUsageBarProps {
  label: string
  count: number
  total: number
}

export function ModelUsageBar({ label, count, total }: ModelUsageBarProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="bar-container">
        <div className="bar-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
