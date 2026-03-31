import { jsonError, jsonSuccess } from "@/lib/api-response";
import { getEventBySlug, type EventDetail } from "@/lib/site-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug || typeof slug !== "string") {
    return jsonError("Invalid slug parameter", 400);
  }

  try {
    const event = await getEventBySlug(slug);

    if (!event) {
      return jsonError("Event not found", 404);
    }

    return jsonSuccess<EventDetail>(event);
  } catch (error) {
    console.error("[api/events/[slug]] Failed to fetch event:", error);
    return jsonError("Failed to fetch event", 500);
  }
}
