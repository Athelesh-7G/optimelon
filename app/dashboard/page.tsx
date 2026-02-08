"use client"

import React, { useEffect, useState } from "react"
import { DeveloperPanel } from "@/components/melonscope/DeveloperPanel"
import { UserAnalyticsPanel } from "@/components/melonscope/UserAnalyticsPanel"

type TelemetryRecord = {
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
  imageGenerated?: boolean
}

export default function DashboardPage() {
  const [data, setData] = useState<TelemetryRecord[]>([])

  useEffect(() => {
    let active = true
    let eventSource: EventSource | null = null

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

    if (typeof window !== "undefined" && "EventSource" in window) {
      eventSource = new EventSource("/api/telemetry/stream")
      eventSource.onmessage = (event) => {
        try {
          const record = JSON.parse(event.data) as TelemetryRecord
          if (!active) return
          setData((prev) => [record, ...prev].slice(0, 100))
        } catch {
          // ignore parse errors
        }
      }
      eventSource.onerror = () => {
        eventSource?.close()
        eventSource = null
        loadTelemetry()
      }
    } else {
      loadTelemetry()
    }

    const interval = setInterval(loadTelemetry, 5000)

    return () => {
      active = false
      eventSource?.close()
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="melon-scope-container">
      <h1 className="melon-title">🍉 MelonScope</h1>
      <p className="melon-subtitle">
        Real-time intelligence into your AI intelligence
      </p>
      <DeveloperPanel data={data} />
      <UserAnalyticsPanel data={data} />
    </div>
  )
}
