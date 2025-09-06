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
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch rockets" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}