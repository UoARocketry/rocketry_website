import { jsonSuccess } from "@/lib/api-response";
import { getSiteSettings, type SiteSettings } from "@/lib/site-data";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return jsonSuccess<SiteSettings>(settings);
  } catch (error) {
    console.error(
      "[api/site-settings] Failed to fetch site settings, returning defaults:",
      error,
    );
    return jsonSuccess<SiteSettings>({
      memberJoinUrl: "",
      execTeamImageUrl: null,
    });
  }
}
