import prisma from "../../../lib/prisma";

export async function GET() {
  const executives = await prisma.exec.findMany({
    orderBy: {
      order: 'asc'
    }
  });
  return new Response(JSON.stringify(executives), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}