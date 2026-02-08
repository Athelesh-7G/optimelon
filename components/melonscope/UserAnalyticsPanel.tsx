"use client"

import React from "react"

interface TelemetryRecord {
  id: string
  timestamp: number
  intent?: string
  composite: boolean
  modelsUsed: string[]
  totalDuration: number
  imageGenerated?: boolean
}

interface UserAnalyticsPanelProps {
  data: TelemetryRecord[]
}

export function UserAnalyticsPanel({ data }: UserAnalyticsPanelProps) {
  const totalRequests = data.length
  const compositeCount = data.filter((entry) => entry.composite).length
  const compositePercent = totalRequests > 0 ? Math.round((compositeCount / totalRequests) * 100) : 0
  const avgLatency =
    totalRequests > 0
      ? Math.round(data.reduce((sum, entry) => sum + entry.totalDuration, 0) / totalRequests)
      : 0
  const imageCount = data.filter((entry) => entry.imageGenerated).length

  const modelUsage = data.reduce<Record<string, number>>((acc, record) => {
    record.modelsUsed.forEach((model) => {
      acc[model] = (acc[model] || 0) + 1
    })
    return acc
  }, {})
  const mostUsedModel = Object.entries(modelUsage).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  const timeline = data.reduce<Record<string, number>>((acc, entry) => {
    const hour = new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  return (
    <section className="melon-section">
      <h2 className="text-lg font-semibold text-foreground mb-4">User Analytics</h2>
      <div className="metrics-grid">
        <div className="glass-card">
          <h3 className="text-xs text-muted-foreground">Most Used Model</h3>
          <p className="text-lg font-semibold">{mostUsedModel}</p>
        </div>
        <div className="glass-card">
          <h3 className="text-xs text-muted-foreground">Average Response Time</h3>
          <p className="text-lg font-semibold">{avgLatency} ms</p>
        </div>
        <div className="glass-card">
          <h3 className="text-xs text-muted-foreground">% Composite Usage</h3>
          <p className="text-lg font-semibold">{compositePercent}%</p>
        </div>
        <div className="glass-card">
          <h3 className="text-xs text-muted-foreground">Images Generated</h3>
          <p className="text-lg font-semibold">{imageCount}</p>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-sm font-medium text-foreground mb-3">Usage Timeline (by hour)</h3>
        {Object.keys(timeline).length === 0 ? (
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-2 text-xs text-muted-foreground">
            {Object.entries(timeline).map(([hour, count]) => (
              <div key={hour} className="flex justify-between">
                <span>{hour}</span>
                <span>{count} requests</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
