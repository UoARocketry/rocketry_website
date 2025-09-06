import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

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