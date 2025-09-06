import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

type RouteContextParams = {
  params?: { slug?: string | string[] };
};

export async function GET(request: Request, context: unknown) {
  // Narrow `context` safely to the shape we expect (no `any`)
  const params = (context as RouteContextParams)?.params ?? {};
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  try {
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
