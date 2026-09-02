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
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface/60 transition-colors duration-300 hover:border-primary/30">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link relative flex items-center gap-3 px-4 py-3 text-sm text-text-secondary transition-colors duration-200 hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:outline-none"
              aria-label={`${link.label} for ${describedBy} (opens in a new tab)`}
            >
              {/* The accent the rest of the site uses to mark the live item,
                  wiped in from the top rather than just appearing. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-primary transition-transform duration-200 group-hover/link:scale-y-100 group-focus-visible/link:scale-y-100"
              />
              {icon === "play" ? (
                <svg
                  className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-hover/link:scale-110"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
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
              <span className="font-medium transition-transform duration-200 group-hover/link:translate-x-0.5">
                {link.label}
              </span>
              {/* Reveal-on-hover, the same affordance the cards use for
                  "Visit website". */}
              <svg
                className="ml-auto h-4 w-4 shrink-0 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100 group-focus-visible/link:translate-x-0 group-focus-visible/link:opacity-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
