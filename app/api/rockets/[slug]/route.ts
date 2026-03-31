import { jsonError, jsonSuccess } from "@/lib/api-response";
import { getRocketBySlug, type RocketDetail } from "@/lib/site-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug || typeof slug !== "string") {
    return jsonError("Invalid slug parameter", 400);
  }

  try {
    const rocket = await getRocketBySlug(slug);

    if (!rocket) {
      return jsonError("Rocket not found", 404);
    }

    return jsonSuccess<RocketDetail>(rocket);
  } catch (error) {
    console.error("[api/rockets/[slug]] Failed to fetch rocket:", error);
    return jsonError("Failed to fetch rocket", 500);
  }
}
