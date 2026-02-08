export type TelemetryRecord = {
  id: string;
  timestamp: number;
  intent?: string;
  composite: boolean;
  modelsUsed: string[];
  totalDuration: number;
  executionTrace?: {
    step: string;
    model: string;
    duration: number;
  }[];
  textLength?: number;
  imageGenerated?: boolean;
  error?: boolean;
}

const globalStore = globalThis as typeof globalThis & {
  __melonScopeTelemetry?: TelemetryRecord[]
  __melonScopeTelemetrySubscribers?: Set<(record: TelemetryRecord) => void>
}

const telemetryStore: TelemetryRecord[] =
  globalStore.__melonScopeTelemetry ?? []
const telemetrySubscribers: Set<(record: TelemetryRecord) => void> =
  globalStore.__melonScopeTelemetrySubscribers ?? new Set()

if (!globalStore.__melonScopeTelemetry) {
  globalStore.__melonScopeTelemetry = telemetryStore
}
if (!globalStore.__melonScopeTelemetrySubscribers) {
  globalStore.__melonScopeTelemetrySubscribers = telemetrySubscribers
}

export function recordTelemetry(record: TelemetryRecord) {
  telemetryStore.unshift(record)
  if (telemetryStore.length > 100) {
    telemetryStore.pop()
  }
  telemetrySubscribers.forEach((subscriber) => {
    subscriber(record)
  })
}

export function getTelemetry() {
  return telemetryStore
}

export function subscribeTelemetry(
  handler: (record: TelemetryRecord) => void
) {
  telemetrySubscribers.add(handler)
  return () => {
    telemetrySubscribers.delete(handler)
  }
}

export function getModelUsageStats() {
  const data = getTelemetry()
  const usage: Record<string, number> = {}
  data.forEach((record) => {
    record.modelsUsed.forEach((model) => {
      usage[model] = (usage[model] || 0) + 1
    })
  })
  return usage
}

export function getLatencyStats() {
  const data = getTelemetry()
  if (data.length === 0) return null

  const latencies = data.map((entry) => entry.totalDuration).sort((a, b) => a - b)

  const avg = Math.round(
    latencies.reduce((sum, value) => sum + value, 0) / latencies.length
  )

  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0

  return {
    avg,
    min: latencies[0],
    max: latencies[latencies.length - 1],
    p95,
  }
}
