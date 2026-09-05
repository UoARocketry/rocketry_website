import Link from "next/link";

/**
 * Puts the guide in the sidebar under the collection groups, so it can be
 * reached from any screen rather than only by navigating back to the dashboard.
 * Deliberately last: it is reference material, not somewhere you go to work.
 */
export default function GuideNavLink() {
  return (
    <div
      style={{
        marginTop: "1.5rem",
        paddingTop: "1rem",
        borderTop: "1px solid var(--theme-elevation-100)",
      }}
    >
      <Link
        href="/admin/guide"
        style={{
          display: "block",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Guide for committee members
      </Link>
    </div>
  );
}
