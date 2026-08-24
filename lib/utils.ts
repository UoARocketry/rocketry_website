const DEFAULT_LOCALE = "en-US";

const normalizeWhitespace = (value: string) =>
  value.trim().replace(/\s+/g, " ");

function toValidDate(value: string | Date): Date | null {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const ALL_EVENTS_TAG = "all";

export function toSafeJsonLd(data: unknown): string {
  // JSON.stringify doesn't escape "<", so a literal "</script>" inside a
  // string field (e.g. an admin-entered title) would break out of the
  // <script> tag when injected via dangerouslySetInnerHTML.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function formatDateShort(date: string | Date, locale = DEFAULT_LOCALE) {
  const parsed = toValidDate(date);
  return parsed ? parsed.toLocaleDateString(locale) : "";
}

export function formatDateLong(date: string | Date, locale = DEFAULT_LOCALE) {
  const parsed = toValidDate(date);
  if (!parsed) return "";

  return parsed.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateWithTime(
  date: string | Date,
  locale = DEFAULT_LOCALE,
) {
  const parsed = toValidDate(date);
  if (!parsed) return "";

  return parsed.toLocaleString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SessionLike = { readonly date: string };
type EventLike = {
  readonly date: string;
  readonly sessions?: readonly SessionLike[];
};

function getSortedSessionTimestamps(
  sessions: readonly SessionLike[],
): number[] {
  return sessions
    .map((session) => toValidDate(session.date)?.getTime())
    .filter((timestamp): timestamp is number => typeof timestamp === "number")
    .sort((a, b) => a - b);
}

/**
 * The date to show on an event card. For a multi-session series this is the
 * next upcoming session, or the final one once the series has finished.
 */
export function formatEventCardDate(
  event: EventLike,
  locale = DEFAULT_LOCALE,
): string {
  const timestamps = getSortedSessionTimestamps(event.sessions ?? []);

  if (timestamps.length === 0) {
    return formatDateShort(event.date, locale);
  }

  const now = Date.now();
  const nextTimestamp =
    timestamps.find((timestamp) => timestamp >= now) ??
    timestamps[timestamps.length - 1];

  return formatDateShort(new Date(nextTimestamp), locale);
}

/**
 * Session summary shown alongside the date on an event card, or null for
 * one-off and single-session events.
 *
 * While sessions remain it counts what is still to run ("4 of 6 left") rather
 * than the total, so it can't be misread against the next-session date beside
 * it. Once finished it reports the total instead.
 */
export function formatEventSessionsLabel(event: EventLike): string | null {
  const timestamps = getSortedSessionTimestamps(event.sessions ?? []);

  if (timestamps.length < 2) {
    return null;
  }

  const now = Date.now();
  const remaining = timestamps.filter((timestamp) => timestamp >= now).length;

  return remaining > 0
    ? `Sessions: ${remaining} of ${timestamps.length} left`
    : `Sessions: ${timestamps.length} total`;
}

/** True while any part of the event (or series) is still in the future. */
export function isEventUpcoming(event: EventLike): boolean {
  const timestamps = getSortedSessionTimestamps(event.sessions ?? []);
  const now = Date.now();

  if (timestamps.length === 0) {
    const parsed = toValidDate(event.date);
    return parsed ? parsed.getTime() >= now : false;
  }

  return timestamps[timestamps.length - 1] >= now;
}

/** Index of the next session still to run, or -1 when the series has finished. */
export function findNextSessionIndex(
  sessions: readonly SessionLike[],
): number {
  const now = Date.now();
  return sessions.findIndex((session) => {
    const parsed = toValidDate(session.date);
    return parsed ? parsed.getTime() >= now : false;
  });
}

export function normalizeEventTag(value: string | null | undefined) {
  const normalized = normalizeWhitespace(value ?? "").toLowerCase();
  return normalized || "general";
}

export function normalizeEventTagParam(value: string | null | undefined) {
  const normalized = normalizeWhitespace(value ?? "").toLowerCase();
  return normalized || ALL_EVENTS_TAG;
}

export function formatEventTagLabel(value: string | null | undefined) {
  const label = normalizeWhitespace(value ?? "");
  return label || "General";
}
