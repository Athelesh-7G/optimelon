import { sendMessage, type Provider, type ProviderClient, type Message, type ChatParams } from "@/lib/providers"

const DEFAULT_IMAGE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"

interface OrchestratorContext {
  provider: Provider
  client: ProviderClient
  model: string
  messages: Message[]
  params: ChatParams
  stream: boolean
  imageModel?: string
}

export async function orchestrate(prompt: string, context: OrchestratorContext) {
  const lower = prompt.toLowerCase()

  const executionTrace: Array<{ step: string; duration: number }> = []
  let currentInput = prompt
  let finalText: string | null = null
  let finalImage: string | null = null

  const composite =
    lower.includes(" and ") &&
    (lower.includes("image") || lower.includes("diagram"))

  if (composite && !context.stream) {
    try {
      const start1 = Date.now()
      const textResult = await sendMessage(
        context.provider,
        context.client,
        context.model,
        buildMessagesWithPrompt(context.messages, currentInput),
        context.params,
        false
      )
      executionTrace.push({
        step: "model",
        duration: Date.now() - start1,
      })

      if (typeof textResult !== "string" || !textResult) {
        throw new Error("Text model returned invalid output.")
      }

      finalText = textResult

      const start2 = Date.now()
      finalImage = await generateImage(finalText, context.imageModel)
      executionTrace.push({
        step: "image",
        duration: Date.now() - start2,
      })

      return {
        type: "composite",
        content: {
          text: finalText,
          imageUrl: finalImage,
        },
        executionTrace,
      }
    } catch (error) {
      console.error("Composite orchestration failed:", error)
      throw error
    }
  }

  return sendMessage(
    context.provider,
    context.client,
    context.model,
    context.messages,
    context.params,
    context.stream
  )
}

function buildMessagesWithPrompt(messages: Message[], prompt: string): Message[] {
  const updated = [...messages]
  for (let i = updated.length - 1; i >= 0; i -= 1) {
    if (updated[i].role === "user") {
      updated[i] = { ...updated[i], content: prompt }
      return updated
    }
  }
  return [...updated, { role: "user", content: prompt }]
}

async function generateImage(text: string, modelId?: string): Promise<string> {
  const apiKey = process.env.BYTEZ_API_KEY
  if (!apiKey) {
    throw new Error("BYTEZ_API_KEY not configured. Add your API key in the Vars section.")
  }

  const model = modelId || DEFAULT_IMAGE_MODEL
  const encodedModel = encodeURIComponent(model)
  const url = `https://api.bytez.com/models/v2/${encodedModel}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Bytez API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`Bytez error: ${data.error}`)
  }

  let output = data.output
  if (Array.isArray(output)) {
    output = output[0]
  }

  if (typeof output !== "string") {
    throw new Error("Unsupported image output format")
  }

  if (output.startsWith("http://") || output.startsWith("https://")) {
    return output
  }

  const padded = output + "=".repeat((4 - (output.length % 4)) % 4)
  return `data:image/png;base64,${padded}`
}
