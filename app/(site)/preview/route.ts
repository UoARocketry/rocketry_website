import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";

/**
 * Enables Next's draft mode so an editor can see an unpublished document on
 * the real site before publishing it, then sends them to the page.
 *
 * Lives at `/preview` rather than under `/api` because `app/(payload)/api/
 * [...slug]` is a catch-all that owns that namespace.
 *
 * Access is the logged-in Payload session, verified with `payload.auth` against
 * the request's own cookies. That avoids inventing a shared preview secret, and
 * means revoking someone's CMS account revokes their preview access with it.
 */

/** Only these collections have a public detail page worth previewing. */
const PREVIEWABLE: Record<string, string> = {
  rockets: "/rockets",
  events: "/events",
};

/** Matches the slug field's own format. Also the open-redirect guard: without
 *  it, `slug` could carry `../` or a scheme and steer the redirect off-site. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const slug = searchParams.get("slug");

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });

  if (!user) {
    return new Response(
      "You must be signed in to the admin to preview drafts.",
      { status: 401 },
    );
  }

  const basePath = collection ? PREVIEWABLE[collection] : undefined;

  if (!basePath || !slug || !SLUG_PATTERN.test(slug)) {
    return new Response("Invalid preview target.", { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  // `redirect` signals by throwing, so it must be the last thing here and must
  // not sit inside a try/catch.
  redirect(`${basePath}/${slug}`);
}
