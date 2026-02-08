import { getTelemetry } from "@/lib/telemetry"

type ModelScore = {
  model: string
  score: number
}

const INTENT_WEIGHTS: Record<string, Record<string, number>> = {
  coding: {
    "Qwen3-Coder-480B": 10,
    "Qwen2.5-7B-Instruct": 7,
    "DeepSeek-V3.2": 6,
  },
  reasoning: {
    "DeepSeek-V3.2": 10,
    "LLaMA-3.3-70B": 8,
    "Qwen3-Coder-480B": 6,
  },
  creative: {
    "GLM-4.5-Air": 9,
    "Qwen2.5-7B-Instruct": 7,
  },
  general: {},
}

function calculateLatencyScore(model: string) {
  const data = getTelemetry()
  const modelRuns = data.filter((record) => record.modelsUsed.includes(model))
  if (modelRuns.length === 0) return 5

  const avgLatency =
    modelRuns.reduce((sum, record) => sum + record.totalDuration, 0) /
    modelRuns.length

  if (avgLatency < 2000) return 8
  if (avgLatency < 5000) return 5
  return 2
}

function calculateFeedbackScore(model: string) {
  const data = getTelemetry()
  const modelRuns = data.filter((record) => record.modelsUsed.includes(model))

  if (modelRuns.length === 0) return 5

  const errorCount = modelRuns.filter((record) => record.error).length

  if (errorCount === 0) return 8
  if (errorCount < 3) return 5
  return 2
}

function calculateUsagePenalty(model: string) {
  const data = getTelemetry()
  const usageCount = data.filter((record) => record.modelsUsed.includes(model)).length

  if (usageCount > 20) return -3
  return 0
}

export function getAdaptiveModel(
  intent: string,
  candidateModels: string[],
  fallbackModel: string
) {
  try {
    const telemetry = getTelemetry()

    if (!telemetry || telemetry.length < 3) {
      return fallbackModel
    }

    const scores: ModelScore[] = candidateModels.map((model) => {
      const intentScore =
        INTENT_WEIGHTS[intent]?.[model] ?? 5

      const latencyScore = calculateLatencyScore(model)
      const feedbackScore = calculateFeedbackScore(model)
      const usagePenalty = calculateUsagePenalty(model)

      const total =
        intentScore +
        latencyScore +
        feedbackScore +
        usagePenalty

      return { model, score: total }
    })

    scores.sort((a, b) => b.score - a.score)

    return scores[0]?.model ?? fallbackModel
  } catch (err) {
    console.warn("Adaptive router failed. Falling back.")
    return fallbackModel
  }
}
