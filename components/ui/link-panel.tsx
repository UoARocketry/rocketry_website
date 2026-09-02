import type { ResourceLink } from "@/lib/site-data.types";

/**
 * A titled panel of outbound links.
 *
 * Shared by a rocket's videos and by the resource links on both rockets and
 * events, so the two read as sibling sections rather than as unrelated
 * widgets. Only the icon differs: a play triangle says "this is footage", an
 * arrow says "this leaves the site".
 */
export default function LinkPanel({
  heading,
  links,
  icon,
  describedBy,
}: {
  readonly heading: string;
  readonly links: readonly ResourceLink[];
  readonly icon: "play" | "external";
  /** Names the thing these links belong to, for screen readers. */
  readonly describedBy: string;
}) {
  if (links.length === 0) return null;

  const headingId = `${icon}-links-${heading.toLowerCase().replace(/\W+/g, "-")}`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-2 text-xl font-bold text-primary">
        {heading}
      </h2>
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface/60">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary transition-colors hover:bg-primary/10 hover:text-text-main"
              aria-label={`${link.label} for ${describedBy} (opens in a new tab)`}
            >
              {icon === "play" ? (
                <svg
                  className="h-4 w-4 shrink-0 text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 shrink-0 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              )}
              <span className="font-medium">{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
