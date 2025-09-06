export async function GET() {
  return new Response(JSON.stringify({ ok: true, now: new Date().toISOString() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}