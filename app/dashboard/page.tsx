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
