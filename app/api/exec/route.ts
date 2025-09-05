import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const exec = await prisma.exec.findMany({
      orderBy: {
        order: 'asc'
      }
    });
    
    return NextResponse.json(exec);
  } catch (error) {
    console.error("Error fetching exec data:", error);
    return NextResponse.json(
      { error: "Failed to fetch exec data" },
      { status: 500 }
    );
  }
}