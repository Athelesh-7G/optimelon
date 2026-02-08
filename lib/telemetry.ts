export type TelemetryRecord = {
  id: string;
  timestamp: number;
  intent?: string;
  composite: boolean;
  modelsUsed: string[];
  totalDuration: number;
  executionTrace?: any[];
  textLength?: number;
  imageGenerated?: boolean;
}

const telemetryStore: TelemetryRecord[] = []

export function recordTelemetry(record: TelemetryRecord) {
  telemetryStore.unshift(record)
  if (telemetryStore.length > 100) {
    telemetryStore.pop()
  }
}

export function getTelemetry() {
  return telemetryStore
}
