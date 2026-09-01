import React from "react";

/**
 * Shown only while Next's draft mode is active, so nobody mistakes an
 * unpublished page for the live one. Rendered per-page rather than in the site
 * layout on purpose: reading draft mode in the layout would force every static
 * page to become dynamic.
 */
export default function DraftBanner({
  returnTo,
}: {
  readonly returnTo?: string;
}) {
  const exitHref = returnTo
    ? `/preview/end?returnTo=${encodeURIComponent(returnTo)}`
    : "/preview/end";

  return (
    <div className="bg-primary text-background px-4 py-2 text-sm font-medium">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <span>
          Draft preview. This is unpublished content and is not visible on the
          live site.
        </span>
        <a href={exitHref} className="underline underline-offset-2">
          Exit preview
        </a>
      </div>
    </div>
  );
}
