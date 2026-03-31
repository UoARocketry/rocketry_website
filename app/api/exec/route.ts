import { NextResponse } from "next/server";
import { getExecTeamPayload } from "@/lib/site-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : undefined;
    const year = Number.isFinite(parsedYear) ? parsedYear : undefined;

    const execPayload = await getExecTeamPayload(year);

    return NextResponse.json(execPayload);
  } catch (error) {
    console.error("Error fetching exec data:", error);
    return NextResponse.json(
      { error: "Failed to fetch exec data" },
      { status: 500 },
    );
  }
}
