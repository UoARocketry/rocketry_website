import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { GUIDE_SECTIONS, GUIDE_CONTACT } from "./guide-content.ts";

/**
 * A handbook for committee members who have never used this admin before.
 *
 * It lives inside the admin rather than in the repository because the people
 * who need it are marketing execs, not developers: a file on GitHub is a file
 * they will never find. The same text is mirrored in `docs/exec-guide.md` for
 * anyone reading the codebase, minus the personal contact details, since that
 * repository is public.
 *
 * Styling uses Payload's own theme variables so the page follows the admin's
 * light and dark themes without carrying a stylesheet of its own.
 */
export default function ExecGuideView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user ?? undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <div
        className="gutter--left gutter--right"
        style={{ maxWidth: "48rem", paddingBottom: "4rem" }}
      >
        <h1 style={{ marginBottom: "0.5rem" }}>Guide for committee members</h1>
        <p
          style={{
            color: "var(--theme-elevation-600)",
            marginTop: 0,
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          How to keep the UARC website up to date. You don&rsquo;t need to know
          anything about code, and you don&rsquo;t have to read all of this.
          Jump to whatever you&rsquo;re trying to do.
        </p>

        <nav
          aria-label="Contents"
          style={{
            background: "var(--theme-elevation-50)",
            border: "1px solid var(--theme-elevation-100)",
            borderRadius: "4px",
            padding: "1rem 1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--theme-elevation-600)",
              margin: "0 0 0.75rem",
            }}
          >
            Contents
          </h2>
          <ol style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 2 }}>
            {GUIDE_SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        {GUIDE_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            style={{ marginBottom: "2.75rem", scrollMarginTop: "1rem" }}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>{section.title}</h2>
            {section.blocks.map((block, index) => {
              if (block.type === "text") {
                return (
                  <p
                    key={index}
                    style={{ lineHeight: 1.65, margin: "0 0 0.9rem" }}
                  >
                    {block.text}
                  </p>
                );
              }

              if (block.type === "steps") {
                return (
                  <ol
                    key={index}
                    style={{
                      lineHeight: 1.65,
                      margin: "0 0 1rem",
                      paddingLeft: "1.3rem",
                    }}
                  >
                    {block.items.map((item, i) => (
                      <li key={i} style={{ marginBottom: "0.35rem" }}>
                        {item}
                      </li>
                    ))}
                  </ol>
                );
              }

              if (block.type === "list") {
                return (
                  <ul
                    key={index}
                    style={{
                      lineHeight: 1.65,
                      margin: "0 0 1rem",
                      paddingLeft: "1.3rem",
                    }}
                  >
                    {block.items.map((item, i) => (
                      <li key={i} style={{ marginBottom: "0.35rem" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }

              // block.type === "callout"
              return (
                <p
                  key={index}
                  style={{
                    background: "var(--theme-elevation-50)",
                    borderLeft: "3px solid var(--theme-elevation-400)",
                    borderRadius: "0 4px 4px 0",
                    padding: "0.85rem 1rem",
                    margin: "0 0 1rem",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>{block.label} </strong>
                  {block.text}
                </p>
              );
            })}
          </section>
        ))}

        <section
          id="who-to-ask"
          style={{ marginBottom: "2rem", scrollMarginTop: "1rem" }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>Who to ask</h2>
          <p style={{ lineHeight: 1.65, margin: "0 0 0.9rem" }}>
            {GUIDE_CONTACT.intro}
          </p>
          <ul style={{ lineHeight: 1.9, margin: 0, paddingLeft: "1.3rem" }}>
            <li>
              Email:{" "}
              <a href={`mailto:${GUIDE_CONTACT.email}`}>
                {GUIDE_CONTACT.email}
              </a>
            </li>
            <li>
              LinkedIn:{" "}
              <a
                href={GUIDE_CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                {GUIDE_CONTACT.linkedinLabel}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </DefaultTemplate>
  );
}
