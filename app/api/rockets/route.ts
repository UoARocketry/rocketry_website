import { jsonError, jsonSuccess } from "@/lib/api-response";
import { getRocketSummaries, type RocketSummary } from "@/lib/site-data";

export async function GET() {
  try {
    const rockets = await getRocketSummaries();
    return jsonSuccess<RocketSummary[]>(rockets ?? []);
  } catch (error) {
    console.error("[api/rockets] Failed to fetch rockets:", error);
    return jsonError("Failed to fetch rockets", 500);
  }
}
