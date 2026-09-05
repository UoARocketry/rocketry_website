"use client";

import { useId, useState } from "react";

type Props = {
  /** The one line always on screen. Keep it under roughly 110 characters. */
  short: string;
  /** Edge cases and detail, hidden until asked for. */
  more?: string;
};

/**
 * A field hint that leads with one line and keeps the detail behind a toggle.
 *
 * Several fields here needed a lot of explaining. "Extra days and times" ran to
 * 350 characters, which rendered as a paragraph of grey text above an empty
 * input and made the Events form look far harder than it is. The detail is
 * worth keeping, it just should not be the first thing you meet, so the summary
 * stays visible and the rest is one click away.
 */
export function FieldHelp({ short, more }: Props) {
  const [open, setOpen] = useState(false);
  const detailId = useId();

  if (!more) {
    return <div className="field-description">{short}</div>;
  }

  return (
    <div className="field-description" style={{ display: "block" }}>
      {short}{" "}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls={detailId}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          font: "inherit",
          color: "var(--theme-text)",
          textDecoration: "underline",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {open ? "Hide help" : "More help"}
      </button>
      {open ? (
        <p
          id={detailId}
          style={{
            margin: "0.5rem 0 0",
            paddingLeft: "0.75rem",
            borderLeft: "2px solid var(--theme-elevation-150)",
            lineHeight: 1.5,
          }}
        >
          {more}
        </p>
      ) : null}
    </div>
  );
}

export default FieldHelp;
