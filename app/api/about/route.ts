import { jsonError, jsonSuccess } from "@/lib/api-response";
import { getAboutPayload, type AboutPayload } from "@/lib/site-data";

export async function GET() {
  try {
    const payload = await getAboutPayload();
    return jsonSuccess<AboutPayload>(payload);
  } catch (error) {
    console.error("[api/about] Failed to fetch about data:", error);
    return jsonError("Failed to fetch about data", 500);
  }
}
