import { subscribeTelemetry } from "@/lib/telemetry"

export async function GET() {
  const encoder = new TextEncoder()
  let unsubscribe: (() => void) | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (record: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(record)}\n\n`)
        )
      }

      unsubscribe = subscribeTelemetry(send)
      controller.enqueue(encoder.encode("event: ready\ndata: {}\n\n"))
    },
    cancel() {
      unsubscribe?.()
      unsubscribe = null
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
