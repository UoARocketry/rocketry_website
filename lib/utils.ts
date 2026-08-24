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
 * next upcoming session (or the final one once the series has finished),
 * annotated with the session count, since the series' own `date` field says
 * little on its own.
 */
export function formatEventCardDate(
  event: EventLike,
  locale = DEFAULT_LOCALE,
): string {
  const timestamps = getSortedSessionTimestamps(event.sessions ?? []);

  if (timestamps.length === 0) {
    return formatDateShort(event.date, locale);
  }

  const nextTimestamp =
    timestamps.find((timestamp) => timestamp >= Date.now()) ??
    timestamps[timestamps.length - 1];
  const label = formatDateShort(new Date(nextTimestamp), locale);

  return timestamps.length > 1
    ? `${label} · ${timestamps.length} sessions`
    : label;
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
