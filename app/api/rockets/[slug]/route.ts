import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  try {
    const rocket = await prisma.rocket.findUnique({ where: { slug } });
    if (!rocket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rocket);
  } catch (error) {
    console.error('Error fetching rocket by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch rocket' }, { status: 500 });
  }
}