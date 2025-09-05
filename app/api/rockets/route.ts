import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const rockets = await prisma.rocket.findMany({
      orderBy: { launchedAt: 'desc' }
    });
    return NextResponse.json(rockets);
  } catch (error) {
    console.error('Error fetching rockets:', error);
    return NextResponse.json({ error: 'Failed to fetch rockets' }, { status: 500 });
  }
}