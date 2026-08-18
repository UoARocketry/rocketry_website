import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRocketBySlug, getEventBySlug } from "@/lib/site-data";

export const config = {
  matcher: ["/rockets/:slug", "/events/:slug"],
};

// Works around a Next.js limitation where notFound() called from within a
// page cannot set a real 404 status in apps with multiple independent root
// layouts (this app has (site) and (payload), the latter owned by Payload's
// own RootLayout component). Checking existence here, before any of that
// rendering pipeline runs, lets us rewrite to a genuinely unmatched path so
// the app's working global-not-found handling produces a real 404 — while
// keeping the original URL visible to the browser.
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  try {
    const rocketMatch = pathname.match(/^\/rockets\/([^/]+)$/);
    if (rocketMatch) {
      const rocket = await getRocketBySlug(
        decodeURIComponent(rocketMatch[1]),
      );
      if (!rocket) {
        return NextResponse.rewrite(new URL("/__not_found__", request.url));
      }
    }

    const eventMatch = pathname.match(/^\/events\/([^/]+)$/);
    if (eventMatch) {
      const event = await getEventBySlug(decodeURIComponent(eventMatch[1]));
      if (!event) {
        return NextResponse.rewrite(new URL("/__not_found__", request.url));
      }
    }
  } catch (error) {
    // Fail open: if the existence check itself errors (e.g. DB hiccup),
    // let the request through rather than breaking every rocket/event page
    // load. The page component's own fetch will surface the same error.
    console.error("[proxy] Existence check failed:", error);
  }

  return NextResponse.next();
}
