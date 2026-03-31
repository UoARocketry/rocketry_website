import { NextResponse } from "next/server";
import { getExecTeamPayload } from "@/lib/site-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");

    if (yearParam && !/^\d{4}$/.test(yearParam)) {
      return NextResponse.json(
        { error: "Invalid year query parameter. Expected YYYY format." },
        { status: 400 },
      );
    }

    const year = yearParam ? Number(yearParam) : undefined;

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
