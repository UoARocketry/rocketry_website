import { jsonError, jsonSuccess } from "@/lib/api-response";
import { getSponsors, type Sponsor } from "@/lib/site-data";

export async function GET() {
  try {
    const sponsors = await getSponsors();
    return jsonSuccess<Sponsor[]>(sponsors ?? []);
  } catch (error) {
    console.error("[api/sponsors] Failed to fetch sponsors:", error);
    return jsonError("Failed to fetch sponsors", 500);
  }
}
