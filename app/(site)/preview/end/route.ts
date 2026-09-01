import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Leaves draft mode and returns to the published site. Needs no auth: the worst
 * anyone can do by calling it is stop seeing drafts.
 */
export async function GET(request: Request): Promise<Response> {
  const draft = await draftMode();
  draft.disable();

  const returnTo = new URL(request.url).searchParams.get("returnTo");
  const isSafeInternalPath =
    typeof returnTo === "string" &&
    returnTo.startsWith("/") &&
    !returnTo.startsWith("//");

  redirect(isSafeInternalPath ? returnTo : "/");
}
