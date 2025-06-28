// src/app/api/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  return NextResponse.json({
    databaseUrlPresent: !!databaseUrl,
    nextAuthSecretPresent: !!nextAuthSecret,
    databaseUrlLength: databaseUrl ? databaseUrl.length : 0,
    nextAuthSecretLast5: nextAuthSecret ? nextAuthSecret.slice(-5) : 'N/A'
  });
}