"use client"

import React from "react"

interface ExecutionTraceCardProps {
  timestamp: number
  modelsUsed: string[]
  totalDuration: number
  executionTrace?: {
    step: string
    model: string
    duration: number
  }[]
}

export function ExecutionTraceCard({
  timestamp,
  modelsUsed,
  totalDuration,
  executionTrace,
}: ExecutionTraceCardProps) {
  return (
    <div className="trace-card">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{new Date(timestamp).toLocaleTimeString()}</span>
        <span>{totalDuration} ms</span>
      </div>
      <div className="text-xs text-foreground mt-1">
        {modelsUsed.join(", ")}
      </div>
      {executionTrace && executionTrace.length > 0 && (
        <details className="mt-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer">Execution Details</summary>
          <div className="mt-2 space-y-1">
            {executionTrace.map((step, index) => (
              <div key={`${step.step}-${index}`} className="flex justify-between">
                <span>{step.step} • {step.model}</span>
                <span>{step.duration} ms</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
