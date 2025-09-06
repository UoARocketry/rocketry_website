import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

type RouteParams = {
  params: {
    slug: string;
  };
};

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  const { slug } = params;

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  try {
    const rocket = await prisma.rocket.findUnique({ 
      where: { slug } 
    });
    
    if (!rocket) {
      return NextResponse.json({ error: 'Rocket not found' }, { status: 404 });
    }
    
    return NextResponse.json(rocket);
  } catch (error) {
    console.error('Error fetching rocket by slug:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}