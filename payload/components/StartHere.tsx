import Link from "next/link";

/**
 * The first thing on the dashboard, above the storage meter.
 *
 * A new committee member's first screen was previously a pair of usage bars and
 * a grid of twelve collection names, with nothing explaining what any of it
 * controlled. This is the orientation, and the way into the full guide.
 */
export default function StartHere() {
  return (
    <div
      style={{
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "4px",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem" }}>
        New here? Start with the guide
      </h2>
      <p
        style={{
          margin: "0 0 1rem",
          lineHeight: 1.6,
          color: "var(--theme-elevation-700)",
          maxWidth: "60ch",
        }}
      >
        Everything on this dashboard controls part of the public website. The
        guide walks through the jobs you will actually do: adding an event,
        updating the exec team, adding a sponsor, and the difference between
        saving a draft and publishing.
      </p>
      <Link
        href="/admin/guide"
        style={{
          display: "inline-block",
          background: "var(--theme-elevation-800)",
          color: "var(--theme-elevation-0)",
          borderRadius: "4px",
          padding: "0.5rem 1rem",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Open the guide
      </Link>
    </div>
  );
}
