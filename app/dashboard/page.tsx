"use client"

import React, { useEffect, useState } from "react"

type TelemetryRecord = {
  id: string
  timestamp: number
  intent?: string
  composite: boolean
  modelsUsed: string[]
  totalDuration: number
}

export default function DashboardPage() {
  const [data, setData] = useState<TelemetryRecord[]>([])

  useEffect(() => {
    let active = true

    const loadTelemetry = async () => {
      try {
        const response = await fetch("/api/telemetry")
        if (!response.ok) return
        const payload = await response.json()
        if (active) {
          setData(Array.isArray(payload) ? payload : payload.data ?? [])
        }
      } catch {
        // ignore fetch errors for now
      }
    }

    loadTelemetry()
    const interval = setInterval(loadTelemetry, 2000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  const totalRequests = data.length
  const compositeCount = data.filter((entry) => entry.composite).length
  const avgLatency =
    data.length > 0
      ? Math.round(data.reduce((sum, entry) => sum + entry.totalDuration, 0) / data.length)
      : 0

  return (
    <div className="melon-scope-container">
      <h1 className="melon-title">🍉 MelonScope</h1>
      <p className="melon-subtitle">
        Real-time intelligence into your AI intelligence
      </p>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Requests</h3>
          <p>{totalRequests}</p>
        </div>

        <div className="metric-card">
          <h3>Composite Flows</h3>
          <p>{compositeCount}</p>
        </div>

        <div className="metric-card">
          <h3>Avg Latency (ms)</h3>
          <p>{avgLatency}</p>
        </div>
      </div>

      <div className="table-section">
        <h2>Recent Executions</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Models</th>
              <th>Latency</th>
              <th>Composite</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.timestamp).toLocaleTimeString()}</td>
                <td>{item.modelsUsed.join(", ")}</td>
                <td>{item.totalDuration} ms</td>
                <td>{item.composite ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
