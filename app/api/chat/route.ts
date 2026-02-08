import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages } = body

    // TODO: replace this with your real model call
    const result = "MelonScope + Adaptive routing working"

    return Response.json({ reply: result })
  } catch (error) {
    console.error("Chat API error:", error)

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
