import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { resolveSafeReturnPath } from "@/lib/safe-redirect";

/**
 * Leaves draft mode and returns to the published site. Needs no auth: the worst
 * anyone can do by calling it is stop seeing drafts.
 *
 * `returnTo` is attacker-controllable and this route is public, so it is
 * narrowed to a same-site path by `resolveSafeReturnPath` rather than by a
 * prefix check. See that function for the browser parsing rules that make a
 * prefix check insufficient.
 */
export async function GET(request: Request): Promise<Response> {
  const draft = await draftMode();
  draft.disable();

  const returnTo = new URL(request.url).searchParams.get("returnTo");

  // `redirect` signals by throwing, so it must be the last thing here.
  redirect(resolveSafeReturnPath(returnTo));
}
