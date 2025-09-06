import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const rockets = await prisma.rocket.findMany({
      take: 2,
      orderBy: { launchedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        description: true,
        launchedAt: true,
      },
    });
    return new Response(JSON.stringify(rockets), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error('Database error in /api/rockets:', err);
    
    // If it's a connection error, try to disconnect and reconnect
    if (err instanceof Error && err.message.includes('prepared statement')) {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting:', disconnectError);
      }
    }
    
    return new Response(JSON.stringify({ error: "Failed to fetch rockets" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}