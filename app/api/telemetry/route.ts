import { getTelemetry } from "@/lib/telemetry"

export async function GET() {
  return Response.json(getTelemetry())
}
