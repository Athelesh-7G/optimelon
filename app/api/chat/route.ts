import { NextRequest } from "next/server"
import {
  createProviderClient,
  sendMessage,
  type Provider,
  type Message,
  type ChatParams,
} from "@/lib/providers"
import { buildSystemPrompt } from "@/lib/promptTemplate"

interface ChatRequest {
  messages: Message[]
  provider: Provider
  model: string
  params: ChatParams
  stream?: boolean
}

const VALID_PROVIDERS = [
  "bytez",
  "openai",
  "claude",
  "gemini",
  "moonshot",
  "deepseek",
  "groq",
  "together",
]

// Map provider to env var names
const PROVIDER_ENV_KEYS: Record<string, string> = {
  bytez: "BYTEZ_API_KEY",
  openai: "OPENAI_API_KEY",
  claude: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
  moonshot: "MOONSHOT_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  groq: "GROQ_API_KEY",
  together: "TOGETHER_API_KEY",
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, provider, model, params, stream = false } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages are required" }, { status: 400 })
    }

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      return Response.json({ error: "Invalid provider" }, { status: 400 })
    }

    if (!model || typeof model !== "string") {
      return Response.json({ error: "Model is required" }, { status: 400 })
    }

    const envKey = PROVIDER_ENV_KEYS[provider]
    const apiKey = process.env[envKey]

    if (!apiKey) {
      return Response.json(
        { error: `${envKey} not configured. Add your API key in the Vars section.` },
        { status: 500 }
      )
    }

    const baseUrl = provider === "openai" ? process.env.OPENAI_BASE_URL : undefined
    const client = createProviderClient(provider, apiKey, baseUrl)

    // Build intelligent system prompt based on user intent
    const systemPrompt = buildSystemPrompt(messages)
    
    // Check if messages already have a system message
    const hasSystemMessage = messages.some((m) => m.role === "system")
    
    // Prepare final messages with injected system prompt
    const finalMessages: Message[] = hasSystemMessage
      ? messages // User provided their own system message, respect it
      : [{ role: "system", content: systemPrompt }, ...messages]

    if (stream) {
      const result = await sendMessage(provider, client, model, finalMessages, params, true)

      if (result instanceof ReadableStream) {
        return new Response(result, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        })
      }

      return Response.json({ reply: result })
    }

    const reply = await sendMessage(provider, client, model, finalMessages, params, false)
    return Response.json({ reply })
  } catch (error) {
    console.error("Chat API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
