import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  try {
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}