import { NextRequest } from "next/server"
import {
  createProviderClient,
  type Provider,
  type Message,
  type ChatParams,
} from "@/lib/providers"
import { buildSystemPrompt } from "@/lib/promptTemplate"
import { orchestrate } from "@/lib/orchestrator"

export async function GET() {
  const encoder = new TextEncoder()

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

    const latestUserMessage = [...finalMessages].reverse().find((m) => m.role === "user")?.content ?? ""
    const result = await orchestrate(latestUserMessage, {
      provider,
      client,
      model,
      messages: finalMessages,
      params,
      stream,
    })

    if (stream && result instanceof ReadableStream) {
      return new Response(result, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    return Response.json({ reply: result })
  } catch (error) {
    console.error("Chat API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
