import React from "react";
import {
  ROCKET_STATUS_LABELS,
  getRocketStatus,
  type RocketStatus,
} from "@/lib/utils";

/**
 * A status pill. `primary` reads as active/newsworthy, `muted` as a quiet
 * state note — the palette is monochrome plus one orange, so tone rather than
 * hue has to carry the difference.
 */
export type StatusBadge = {
  readonly label: string;
  readonly tone: "primary" | "muted";
  readonly icon: "calendar" | "blueprint";
};

// Both are drawn coarsely on purpose: these render at 14px, where a detailed
// glyph (a wrench, a cog) collapses into an unreadable smudge.
const ICON_PATHS: Record<StatusBadge["icon"], string> = {
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  blueprint: "M4 4h16v16H4zM4 9h16M9 9v11",
};

const TONE_CLASSES: Record<StatusBadge["tone"], string> = {
  primary: "border-primary/40 bg-primary/15 text-primary",
  muted: "border-border bg-elevated text-text-secondary",
};

/**
 * The badge for a rocket, or null once it has flown — a launched rocket is the
 * default state on this site and does not need calling out.
 */
export function rocketStatusBadge(rocket: {
  readonly launchedAt?: string | null;
}): StatusBadge | null {
  const status: RocketStatus = getRocketStatus(rocket);

  if (status === "launched") {
    return null;
  }

  return {
    label: ROCKET_STATUS_LABELS[status],
    tone: status === "scheduled" ? "primary" : "muted",
    icon: status === "scheduled" ? "calendar" : "blueprint",
  };
}

export default function StatusBadgePill({
  badge,
  className = "",
}: {
  readonly badge: StatusBadge;
  readonly className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[badge.tone]} ${className}`}
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={ICON_PATHS[badge.icon]}
        />
      </svg>
      {badge.label}
    </span>
  );
}
