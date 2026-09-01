import React from "react";

/**
 * Shown only while Next's draft mode is active, so nobody mistakes an
 * unpublished page for the live one. Rendered per-page rather than in the site
 * layout on purpose: reading draft mode in the layout would force every static
 * page to become dynamic.
 *
 * Draft mode means "render the newest saved version", which is not the same as
 * "this document is unpublished". The Preview button turns it on for every
 * document, so a banner that always claimed the content was unpublished told
 * editors their live, published pages were invisible to the public.
 */
export default function DraftBanner({
  returnTo,
  isPublished = false,
}: {
  readonly returnTo?: string;
  /** Whether the document being previewed is currently published. */
  readonly isPublished?: boolean;
}) {
  const exitHref = returnTo
    ? `/preview/end?returnTo=${encodeURIComponent(returnTo)}`
    : "/preview/end";

  return (
    <div className="bg-primary text-background px-4 py-2 text-sm font-medium">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <span>
          {isPublished
            ? "Preview mode. This page is published, so visitors see it too. You are viewing the most recently saved version, including any changes not yet published."
            : "Draft preview. This page is not published, so visitors cannot see it yet."}
        </span>
        <a href={exitHref} className="underline underline-offset-2">
          Exit preview
        </a>
      </div>
    </div>
  );
}
