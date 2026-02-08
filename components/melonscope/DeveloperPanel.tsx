"use client"

import React from "react"
import { ModelUsageBar } from "./ModelUsageBar"
import { ExecutionTraceCard } from "./ExecutionTraceCard"

interface TelemetryRecord {
  id: string
  timestamp: number
  intent?: string
  composite: boolean
  modelsUsed: string[]
  totalDuration: number
  executionTrace?: {
    step: string
    model: string
    duration: number
  }[]
}

interface DeveloperPanelProps {
  data: TelemetryRecord[]
}

export function DeveloperPanel({ data }: DeveloperPanelProps) {
  const totalRequests = data.length
  const compositeCount = data.filter((entry) => entry.composite).length
  const latencies = data.map((entry) => entry.totalDuration).sort((a, b) => a - b)
  const avgLatency =
    latencies.length > 0
      ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
      : 0
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)] || 0
  const minLatency = latencies[0] || 0
  const maxLatency = latencies[latencies.length - 1] || 0

  const modelUsage = data.reduce<Record<string, number>>((acc, record) => {
    record.modelsUsed.forEach((model) => {
      acc[model] = (acc[model] || 0) + 1
    })
    return acc
  }, {})
  const totalModelUses = Object.values(modelUsage).reduce((sum, value) => sum + value, 0)

  const recentComposite = data.filter((entry) => entry.composite).slice(0, 5)

  return (
    <section className="melon-section">
      <h2 className="text-lg font-semibold text-foreground mb-4">Developer Telemetry</h2>
      <div className="metrics-grid">
        <div className="glass-card">
          <h3 className="text-xs text-muted-foreground">Total Requests</h3>
          <p className="text-lg font-semibold">{totalRequests}</p>
        </div>
        <div className="glass-card">
          <h3 className="text-xs text-muted-foreground">Composite Count</h3>
          <p className="text-lg font-semibold">{compositeCount}</p>
        </div>
        <div className="glass-card">
          <h3 className="text-xs text-muted-foreground">Avg Latency</h3>
          <p className="text-lg font-semibold">{avgLatency} ms</p>
        </div>
        <div className="glass-card">
          <h3 className="text-xs text-muted-foreground">P95 Latency</h3>
          <p className="text-lg font-semibold">{p95Latency} ms</p>
        </div>
        <div className="glass-card">
          <h3 className="text-xs text-muted-foreground">Min / Max</h3>
          <p className="text-lg font-semibold">{minLatency} / {maxLatency} ms</p>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-sm font-medium text-foreground mb-3">Model Usage Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(modelUsage).length === 0 ? (
            <p className="text-xs text-muted-foreground">No model usage yet.</p>
          ) : (
            Object.entries(modelUsage).map(([model, count]) => (
              <ModelUsageBar key={model} label={model} count={count} total={totalModelUses} />
            ))
          )}
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-sm font-medium text-foreground mb-3">Execution Trace Explorer</h3>
        {recentComposite.length === 0 ? (
          <p className="text-xs text-muted-foreground">No composite executions yet.</p>
        ) : (
          <div className="space-y-3">
            {recentComposite.map((entry) => (
              <ExecutionTraceCard
                key={entry.id}
                timestamp={entry.timestamp}
                modelsUsed={entry.modelsUsed}
                totalDuration={entry.totalDuration}
                executionTrace={entry.executionTrace}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
