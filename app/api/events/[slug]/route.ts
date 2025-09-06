import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET( request: Request, { params }: { params: Record<string, string | string[]> }) {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  try {
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return new Response(JSON.stringify({ slug }), { status: 200, headers: { "content-type": "application/json" },});
  }
}