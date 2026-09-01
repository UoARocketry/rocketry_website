/**
 * Pinned, and every date on the site must go through these helpers rather than
 * calling `toLocaleDateString()` bare.
 *
 * Without an explicit locale the runtime's own is used, which differs between
 * the Vercel server (en-US) and a visitor's browser (en-NZ here). The two
 * render different strings for the same date, React sees the server HTML and
 * the client render disagree, and hydration fails with error #418 — but only
 * for visitors whose locale is not en-US, which makes it look browser-specific.
 */
const DEFAULT_LOCALE = "en-US";

/**
 * Pinned for the same reason as the locale, and it matters more.
 *
 * Payload's date picker stores what an editor types as their own local time,
 * which for this committee is Auckland. Formatting then happens wherever the
 * code runs: the Vercel server is UTC, so an event entered as 12:00 PM
 * rendered as 12:00 AM on the live site, and anything in the 13 hours before
 * midnight NZ was reported on the wrong day entirely.
 */
const DEFAULT_TIME_ZONE = "Pacific/Auckland";

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
  return parsed
    ? parsed.toLocaleDateString(locale, { timeZone: DEFAULT_TIME_ZONE })
    : "";
}

export function formatDateLong(date: string | Date, locale = DEFAULT_LOCALE) {
  const parsed = toValidDate(date);
  if (!parsed) return "";

  return parsed.toLocaleDateString(locale, {
    timeZone: DEFAULT_TIME_ZONE,
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
    timeZone: DEFAULT_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SessionLike = {
  readonly title?: string;
  readonly date: string;
  readonly endTime?: string | null;
  /** A session can span days, exactly as the event itself can. */
  readonly extraDates?: readonly ExtraDateLike[];
};

/** One further day of a multi-day event, with optional per-day hours. */
type ExtraDateLike = {
  readonly date: string;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
};

type EventLike = {
  readonly date: string;
  readonly endTime?: string | null;
  readonly sessions?: readonly SessionLike[];
  readonly extraDates?: readonly ExtraDateLike[];
};

/** The clock part of a stored timestamp, e.g. "3:00 PM". */
export function formatTimeOfDay(
  value: string | Date | null | undefined,
  locale = DEFAULT_LOCALE,
): string {
  if (!value) return "";

  const parsed = toValidDate(value);
  if (!parsed) return "";

  return parsed.toLocaleTimeString(locale, {
    timeZone: DEFAULT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "12:00 PM – 3:00 PM", or just the start when there is no end. */
export function formatTimeRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
  locale = DEFAULT_LOCALE,
): string {
  const from = formatTimeOfDay(start, locale);
  const to = formatTimeOfDay(end, locale);

  if (!from) return "";
  return to ? `${from} – ${to}` : from;
}

/** "a", "a & b", "a, b & c" — the way a person would read a list aloud. */
function joinReadable(parts: readonly string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} & ${parts[parts.length - 1]}`;
}

type DayParts = { year: string; month: string; day: string };

/**
 * Calendar parts as they read in Auckland. Going through `formatToParts`
 * rather than the Date's own getters is what keeps a late-evening event on the
 * right day when this runs on a UTC server.
 */
function getDayParts(date: Date, locale: string): DayParts {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone: DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).formatToParts(date);

  const find = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return { year: find("year"), month: find("month"), day: find("day") };
}

/**
 * Compresses a run of days into a single readable label, repeating the month
 * only when it changes and the year only when the days straddle one:
 * "September 3, 4 & 5, 2026", "September 30 & October 1, 2026",
 * "December 31, 2026 & January 1, 2027".
 */
function formatDayList(days: readonly DayParts[], sameYear: boolean): string {
  const groups: { month: string; year: string; days: string[] }[] = [];

  for (const day of days) {
    const current = groups[groups.length - 1];

    if (current && current.month === day.month && current.year === day.year) {
      current.days.push(day.day);
    } else {
      groups.push({ month: day.month, year: day.year, days: [day.day] });
    }
  }

  const rendered = groups.map((group) => {
    const dayList = joinReadable(group.days);
    return sameYear
      ? `${group.month} ${dayList}`
      : `${group.month} ${dayList}, ${group.year}`;
  });

  const joined = joinReadable(rendered);
  return sameYear ? `${joined}, ${days[0].year}` : joined;
}

export type EventWhen = {
  /** The day or days, e.g. "September 3 & 4, 2026". */
  dateLabel: string;
  /** Hours shared by every day, or null when they differ. */
  timeLabel: string | null;
  /** Per-day hours, only when the days do not share a time window. */
  schedule: { day: string; time: string }[];
};

/**
 * The "when" of an event, ready to render.
 *
 * A one-off keeps the weekday it has always shown. Extra days collapse into a
 * single line, with the hours stated once when every day shares them and
 * listed per day when they do not.
 */
export function formatEventWhen(
  event: EventLike,
  locale = DEFAULT_LOCALE,
): EventWhen {
  const startTime = event.date;
  const endTime = event.endTime ?? null;

  const days = [
    { date: toValidDate(event.date), start: startTime, end: endTime },
    ...(event.extraDates ?? []).map((extra) => ({
      date: extra.date ? toValidDate(extra.date) : null,
      // A blank per-day time means "same hours as the first day".
      start: extra.startTime ?? startTime,
      end: extra.endTime ?? endTime,
    })),
  ]
    .filter(
      (day): day is { date: Date; start: string; end: string | null } =>
        day.date !== null,
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (days.length === 0) {
    return { dateLabel: "", timeLabel: null, schedule: [] };
  }

  const times = days.map((day) => formatTimeRange(day.start, day.end, locale));

  if (days.length === 1) {
    return {
      dateLabel: formatDateWithWeekday(days[0].date, locale),
      timeLabel: times[0] || null,
      schedule: [],
    };
  }

  const parts = days.map((day) => getDayParts(day.date, locale));
  const sameYear = parts.every((part) => part.year === parts[0].year);
  const dateLabel = formatDayList(parts, sameYear);

  const shared = times.every((time) => time === times[0]);

  if (shared) {
    return {
      dateLabel,
      timeLabel: times[0]
        ? `${times[0]}, ${days.length === 2 ? "both days" : "all days"}`
        : null,
      schedule: [],
    };
  }

  return {
    dateLabel,
    timeLabel: null,
    schedule: parts.map((part, index) => ({
      day: `${part.month} ${part.day}`,
      time: times[index],
    })),
  };
}

function formatDateWithWeekday(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    timeZone: DEFAULT_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

function getExtraDateTimestamps(
  source: { readonly extraDates?: readonly ExtraDateLike[] } | undefined,
): number[] {
  return (source?.extraDates ?? [])
    .map((extra) => toValidDate(extra.date)?.getTime())
    .filter((timestamp): timestamp is number => typeof timestamp === "number");
}

/**
 * Puts dated entries in chronological order without mutating the input.
 *
 * Entries whose date will not parse keep their position rather than being
 * dropped, so a half-filled row in the CMS stays visible to whoever has to
 * fix it instead of silently disappearing from the page.
 */
export function sortByDate<T extends { readonly date: string }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) => {
    const left = toValidDate(a.date)?.getTime();
    const right = toValidDate(b.date)?.getTime();

    if (typeof left !== "number" || typeof right !== "number") return 0;
    return left - right;
  });
}

/**
 * When a session starts and when its last day is over.
 *
 * A session is no longer a single instant: like the event itself it can run
 * across several days, so "has it finished" has to look at its final day
 * rather than its start. Extra days come from a day-only picker, hence the
 * same "runs until the next midnight" rule the event uses.
 */
type SessionSpan = { start: number; end: number };

function getSessionSpans(sessions: readonly SessionLike[]): SessionSpan[] {
  return sessions
    .map((session) => {
      const start = toValidDate(session.date)?.getTime();
      if (typeof start !== "number") return null;

      const extras = getExtraDateTimestamps(session).map(
        (timestamp) => timestamp + DAY_MS,
      );

      return { start, end: Math.max(start, ...extras) };
    })
    .filter((span): span is SessionSpan => span !== null)
    .sort((a, b) => a.start - b.start);
}

/**
 * Every day an event runs on, sorted.
 *
 * A series is described entirely by its sessions, so those replace the event's
 * own date rather than adding to it. A plain multi-day event instead lists its
 * first day as `date` and the rest as extra days.
 */
function getOccurrenceSpans(event: EventLike): SessionSpan[] {
  const sessions = getSessionSpans(event.sessions ?? []);
  if (sessions.length > 0) return sessions;

  const start = toValidDate(event.date)?.getTime();

  return [
    ...(typeof start === "number" ? [{ start, end: start }] : []),
    ...getExtraDateTimestamps(event).map((timestamp) => ({
      start: timestamp,
      end: timestamp + DAY_MS,
    })),
  ].sort((a, b) => a.start - b.start);
}

/**
 * The date to show on an event card: the next day still to run, or the final
 * one once the event has finished. Covers both a multi-session series and a
 * plain event spread over consecutive days.
 */
export function formatEventCardDate(
  event: EventLike,
  locale = DEFAULT_LOCALE,
): string {
  const spans = getOccurrenceSpans(event);

  if (spans.length === 0) {
    return formatDateShort(event.date, locale);
  }

  const now = Date.now();
  // Selected on when it finishes, so a session part-way through its run is
  // still "next", but shown by when it starts, which is the date on the poster.
  const next = spans.find((span) => span.end >= now) ?? spans[spans.length - 1];

  return formatDateShort(new Date(next.start), locale);
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
  const spans = getSessionSpans(event.sessions ?? []);

  if (spans.length < 2) {
    return null;
  }

  const now = Date.now();
  // A session spanning two days is one session, so this counts sessions still
  // to finish rather than days still to run.
  const remaining = spans.filter((span) => span.end >= now).length;

  return remaining > 0
    ? `Sessions: ${remaining} of ${spans.length} left`
    : `Sessions: ${spans.length} total`;
}

/** True while any part of the event (or series) is still in the future. */
export function isEventUpcoming(event: EventLike): boolean {
  const sessions = getSessionSpans(event.sessions ?? []);
  const now = Date.now();

  if (sessions.length > 0) {
    // Spans are ordered by when they start, and the one starting last is not
    // necessarily the one finishing last.
    return Math.max(...sessions.map((span) => span.end)) >= now;
  }

  const start = toValidDate(event.date)?.getTime();

  // The day-only picker stores an extra day as its opening midnight. Read
  // literally that would retire an event the instant its final day began,
  // which is exactly when people are still checking the details, so a day
  // counts as running until the next midnight.
  const ends = [
    ...(typeof start === "number" ? [start] : []),
    ...getExtraDateTimestamps(event).map((timestamp) => timestamp + DAY_MS),
  ];

  return ends.length > 0 && Math.max(...ends) >= now;
}

/**
 * Index of the next session still to run, or -1 when the series has finished.
 *
 * Keyed on when a session *finishes*, so a two-day session that started
 * yesterday and runs again tomorrow is still the one coming up rather than
 * being marked complete on its opening day.
 */
export function findNextSessionIndex(
  sessions: readonly SessionLike[],
): number {
  const now = Date.now();

  return sessions.findIndex((session) => {
    const start = toValidDate(session.date)?.getTime();
    if (typeof start !== "number") return false;

    const extras = getExtraDateTimestamps(session).map(
      (timestamp) => timestamp + DAY_MS,
    );

    return Math.max(start, ...extras) >= now;
  });
}

export type RocketStatus = "scheduled" | "in-development" | "launched";

type RocketLike = { readonly launchedAt?: string | null };
type RocketOrderable = RocketLike & { readonly name: string };

export const ROCKET_STATUS_LABELS: Record<RocketStatus, string> = {
  scheduled: "Scheduled",
  "in-development": "In Development",
  launched: "Launched",
};

/**
 * A rocket has no status field in the CMS — its state is derived from
 * `launchedAt` alone. Note the three-way split: a date in the *future* means
 * the flight is booked but has not happened, which the older
 * `launchedAt ? "Launched" : "In Development"` check reported as already flown.
 */
export function getRocketStatus(
  rocket: RocketLike,
  now = Date.now(),
): RocketStatus {
  const parsed = rocket.launchedAt ? toValidDate(rocket.launchedAt) : null;

  if (!parsed) {
    return "in-development";
  }

  return parsed.getTime() >= now ? "scheduled" : "launched";
}

const ROCKET_STATUS_RANK: Record<RocketStatus, number> = {
  scheduled: 0,
  "in-development": 1,
  launched: 2,
};

function compareRockets(
  a: RocketOrderable,
  b: RocketOrderable,
  now: number,
): number {
  const statusA = getRocketStatus(a, now);
  const statusB = getRocketStatus(b, now);

  if (statusA !== statusB) {
    return ROCKET_STATUS_RANK[statusA] - ROCKET_STATUS_RANK[statusB];
  }

  const timeA = a.launchedAt ? toValidDate(a.launchedAt)?.getTime() : undefined;
  const timeB = b.launchedAt ? toValidDate(b.launchedAt)?.getTime() : undefined;

  if (typeof timeA === "number" && typeof timeB === "number") {
    // The next launch is the most interesting scheduled rocket, but the most
    // recent flight is the most interesting launched one.
    return statusA === "scheduled" ? timeA - timeB : timeB - timeA;
  }

  return a.name.localeCompare(b.name);
}

/**
 * Orders rockets the way every list on the site shows them: next launch first,
 * then undated builds, then flown rockets newest first.
 *
 * Sorted here rather than in the Payload query because the Postgres adapter
 * emits a bare `desc()` with no NULLS clause, and Postgres defaults `DESC` to
 * NULLS FIRST — so `sort: "-launchedAt"` silently floated every undated rocket
 * above the flown ones.
 *
 * `now` is snapshotted once so a rocket cannot change status partway through
 * the sort and make the comparator inconsistent.
 */
export function sortRockets<T extends RocketOrderable>(
  rockets: readonly T[],
): T[] {
  const now = Date.now();
  return [...rockets].sort((a, b) => compareRockets(a, b, now));
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
