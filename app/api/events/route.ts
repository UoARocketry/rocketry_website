import { jsonError, jsonSuccess } from "@/lib/api-response";
import { getEventsOverview, type EventsOverview } from "@/lib/site-data";

export async function GET() {
  try {
    const payload = await getEventsOverview();
    return jsonSuccess<EventsOverview>(payload);
  } catch (error) {
    console.error("[api/events] Failed to fetch events:", error);
    return jsonError("Failed to fetch events", 500);
  }
}
