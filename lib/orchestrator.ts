import { sendMessage, type Provider, type ProviderClient, type Message, type ChatParams } from "@/lib/providers"
import { recordTelemetry } from "@/lib/telemetry"

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
  const totalStart = Date.now()
  const lower = prompt.toLowerCase()

  const executionTrace: Array<{ step: string; model: string; duration: number }> = []
  let currentInput = prompt
  let finalText: string | null = null
  let finalImage: string | null = null

  const composite = isCompositePrompt(lower)
  const intent = composite ? "composite" : "single"

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
        model: context.model,
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
        model: context.imageModel || DEFAULT_IMAGE_MODEL,
        duration: Date.now() - start2,
      })

      recordTelemetry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        intent,
        composite: true,
        modelsUsed: executionTrace.map((entry) => entry.model).filter(Boolean),
        totalDuration: Date.now() - totalStart,
        executionTrace,
        textLength: finalText?.length,
        imageGenerated: !!finalImage,
        error: false,
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
      recordTelemetry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        intent,
        composite: true,
        modelsUsed: executionTrace.map((entry) => entry.model).filter(Boolean),
        totalDuration: Date.now() - totalStart,
        executionTrace,
        textLength: finalText?.length,
        imageGenerated: !!finalImage,
        error: true,
      })
      console.error("Composite orchestration failed:", error)
      throw error
    }
  }

  const singleStart = Date.now()
  try {
    const result = await sendMessage(
      context.provider,
      context.client,
      context.model,
      context.messages,
      context.params,
      context.stream
    )

    const executionEntry = {
      step: "model",
      model: context.model,
      duration: Date.now() - singleStart,
    }

    recordTelemetry({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      intent,
      composite: false,
      modelsUsed: [context.model],
      totalDuration: Date.now() - totalStart,
      executionTrace: [executionEntry],
      textLength: typeof result === "string" ? result.length : undefined,
      imageGenerated: false,
      error: false,
    })

    return result
  } catch (error) {
    const executionEntry = {
      step: "model",
      model: context.model,
      duration: Date.now() - singleStart,
    }
    recordTelemetry({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      intent,
      composite: false,
      modelsUsed: [context.model],
      totalDuration: Date.now() - totalStart,
      executionTrace: [executionEntry],
      imageGenerated: false,
      error: true,
    })
    throw error
  }
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

function isCompositePrompt(lowerPrompt: string): boolean {
  const compositeTokens = [
    " and ",
    " then ",
    " followed by ",
    " then generate ",
    " then create ",
    " then design ",
    " then render ",
    " then illustrate ",
    " then visualize ",
    " then diagram ",
    " then summarize ",
    " then show ",
    " then draw ",
    " then produce ",
    " then output ",
    " then add ",
    " then include ",
    " then provide ",
    " after that ",
    " afterwards ",
    " next ",
    " second ",
    " lastly ",
    " finally ",
  ]

  const compositePhrases = [
    "explain and create an image",
    "explain and generate an image",
    "explain and show a diagram",
    "summarize and create an image",
    "summarize and generate an image",
    "summarize and show a diagram",
    "analyze and create an image",
    "analyze and generate an image",
    "analyze and show a diagram",
    "compare and create an image",
    "compare and generate an image",
    "compare and show a diagram",
    "describe and create an image",
    "describe and generate an image",
    "describe and show a diagram",
    "write and create an image",
    "write and generate an image",
    "write and show a diagram",
    "draft and create an image",
    "draft and generate an image",
    "draft and show a diagram",
    "outline and create an image",
    "outline and generate an image",
    "outline and show a diagram",
    "break down and create an image",
    "break down and generate an image",
    "break down and show a diagram",
    "explain then create an image",
    "explain then generate an image",
    "explain then show a diagram",
    "summarize then create an image",
    "summarize then generate an image",
    "summarize then show a diagram",
    "analyze then create an image",
    "analyze then generate an image",
    "analyze then show a diagram",
    "compare then create an image",
    "compare then generate an image",
    "compare then show a diagram",
    "describe then create an image",
    "describe then generate an image",
    "describe then show a diagram",
    "write then create an image",
    "write then generate an image",
    "write then show a diagram",
    "draft then create an image",
    "draft then generate an image",
    "draft then show a diagram",
    "outline then create an image",
    "outline then generate an image",
    "outline then show a diagram",
    "convert to a diagram",
    "convert into a diagram",
    "turn into a diagram",
    "turn this into a diagram",
    "turn this into an image",
    "visualize this as a diagram",
    "visualize this as an image",
    "visualize this",
    "create a diagram from this",
    "create an image from this",
    "generate a diagram from this",
    "generate an image from this",
    "draw a diagram from this",
    "draw an image from this",
    "show a diagram of this",
    "show an image of this",
    "make a diagram of this",
    "make an image of this",
    "illustrate this with a diagram",
    "illustrate this with an image",
    "diagram this",
    "diagram it",
    "create a visual",
    "generate a visual",
    "provide a visual",
    "include a visual",
    "add a diagram",
    "add an image",
    "add a visual",
    "with a diagram",
    "with an image",
    "with visuals",
    "provide visuals",
    "visual representation",
    "visual explanation",
    "visual summary",
    "flow diagram",
    "process diagram",
    "architecture diagram",
    "system diagram",
    "sequence diagram",
    "mind map",
    "concept map",
    "timeline diagram",
    "network diagram",
    "org chart",
    "wireframe and explanation",
    "explain and then show a diagram",
    "explain and then show an image",
    "summarize and then show a diagram",
    "summarize and then show an image",
    "analyze and then show a diagram",
    "analyze and then show an image",
    "describe and then show a diagram",
    "describe and then show an image",
    "write and then show a diagram",
    "write and then show an image",
    "draft and then show a diagram",
    "draft and then show an image",
    "outline and then show a diagram",
    "outline and then show an image",
    "create a diagram and explain",
    "generate a diagram and explain",
    "show a diagram and explain",
    "draw a diagram and explain",
    "create an image and explain",
    "generate an image and explain",
    "show an image and explain",
    "draw an image and explain",
  ]

  const compositeKeywords = [
    "image",
    "diagram",
    "visual",
    "illustration",
    "render",
    "infographic",
    "wireframe",
    "mockup",
    "flowchart",
    "mind map",
    "concept map",
    "architecture diagram",
    "process diagram",
    "sequence diagram",
    "system diagram",
    "chart",
    "graph",
    "sketch",
  ]

  const hasCompositeToken = compositeTokens.some((token) => lowerPrompt.includes(token))
  const hasCompositePhrase = compositePhrases.some((phrase) => lowerPrompt.includes(phrase))
  const hasVisualKeyword = compositeKeywords.some((keyword) => lowerPrompt.includes(keyword))

  return (hasCompositeToken && hasVisualKeyword) || hasCompositePhrase
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
