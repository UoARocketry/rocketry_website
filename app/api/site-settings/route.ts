import { getSiteSettings } from "@/lib/site-data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json(
      {
        memberJoinUrl: "",
        execTeamImageUrl: null,
      },
      { status: 200 },
    );
  }
}
