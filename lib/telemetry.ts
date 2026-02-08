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
}

const telemetryStore: TelemetryRecord[] =
  globalStore.__melonScopeTelemetry ?? []

if (!globalStore.__melonScopeTelemetry) {
  globalStore.__melonScopeTelemetry = telemetryStore
}

const telemetrySubscribers = new Set<(records: TelemetryRecord[]) => void>()

export function recordTelemetry(record: TelemetryRecord) {
  telemetryStore.unshift(record)
  if (telemetryStore.length > 100) {
    telemetryStore.pop()
  }
  telemetrySubscribers.forEach((notify) => notify([...telemetryStore]))
}

export function getTelemetry() {
  return telemetryStore
}

export function subscribeTelemetry(subscriber: (records: TelemetryRecord[]) => void) {
  telemetrySubscribers.add(subscriber)
  subscriber([...telemetryStore])
  return () => {
    telemetrySubscribers.delete(subscriber)
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
