import { jsonError, jsonSuccess } from "@/lib/api-response";
import { getExecTeamPayload, type ExecTeamPayload } from "@/lib/site-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");

    if (yearParam && !/^\d{4}$/.test(yearParam)) {
      return jsonError("Invalid year parameter. Expected YYYY format", 400);
    }

    const year = yearParam ? Number(yearParam) : undefined;

    const execPayload = await getExecTeamPayload(year);

    return jsonSuccess<ExecTeamPayload>(execPayload);
  } catch (error) {
    console.error("[api/exec] Failed to fetch exec data:", error);
    return jsonError("Failed to fetch exec data", 500);
  }
}
