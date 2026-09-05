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
/**
 * `decodeURIComponent` throws on malformed percent-encoding such as `/rockets/%`.
 * That must not reach the catch below: failing open there lets the request
 * through to the page, which then throws on the same input and returns a 500.
 * A slug that cannot be decoded cannot match a stored slug either, so the
 * honest answer is the same as any other unknown slug, a 404.
 *
 * Vercel's edge currently rejects these with a 400 before Next is reached, so
 * this is defence for any other host rather than a live fix.
 */
function decodeSlug(rawSlug: string): string | null {
  try {
    return decodeURIComponent(rawSlug);
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const notFound = () =>
    NextResponse.rewrite(new URL("/__not_found__", request.url));

  try {
    const rocketMatch = pathname.match(/^\/rockets\/([^/]+)$/);
    if (rocketMatch) {
      const slug = decodeSlug(rocketMatch[1]);
      if (slug === null) {
        return notFound();
      }

      const rocket = await getRocketBySlug(slug);
      if (!rocket) {
        return notFound();
      }
    }

    const eventMatch = pathname.match(/^\/events\/([^/]+)$/);
    if (eventMatch) {
      const slug = decodeSlug(eventMatch[1]);
      if (slug === null) {
        return notFound();
      }

      const event = await getEventBySlug(slug);
      if (!event) {
        return notFound();
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
