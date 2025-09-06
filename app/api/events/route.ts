import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const events = await prisma.event.findMany({
      where: { isPast: false, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        date: true,
      },
    });
    return new Response(JSON.stringify(events), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error('Database error in /api/events:', err);
    
    // If it's a connection error, try to disconnect and reconnect
    if (err instanceof Error && err.message.includes('prepared statement')) {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting:', disconnectError);
      }
    }
    
    return new Response(JSON.stringify({ error: "Failed to fetch events" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}