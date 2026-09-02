import type { CollectionBeforeValidateHook } from "payload";
import { toDayInputValue } from "../../lib/day-date.ts";
import { minutesOfDay, nzCalendarDay } from "../../lib/utils.ts";

type DayRow = {
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

type SessionRow = {
  title?: string | null;
  date?: string | null;
  endTime?: string | null;
  extraDates?: DayRow[] | null;
};

type EventDoc = {
  date?: string | null;
  endTime?: string | null;
  extraDates?: DayRow[] | null;
  sessions?: SessionRow[] | null;
};

/** The clock part of a row's hours, or null when it states none of its own. */
function hoursKey(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): string | null {
  const start = minutesOfDay(startTime);
  const end = minutesOfDay(endTime);

  return start === null && end === null ? null : `${start ?? ""}-${end ?? ""}`;
}

/** "4 September 2026", from a YYYY-MM-DD key. */
function readableDay(key: string): string {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Every day one thing runs on, checked for repeats.
 *
 * The main date is a real instant and is read on its Auckland day; an extra
 * day is a bare calendar day and is read from its UTC parts. Mixing the two up
 * is the original source of every date bug on this page.
 */
function findRepeats(
  label: string,
  ownDate: string | null | undefined,
  ownEndTime: string | null | undefined,
  extraDates: DayRow[] | null | undefined,
): string[] {
  const errors: string[] = [];
  // Day to the sittings already claimed on it. A day may appear more than
  // once, but never twice at the same hours.
  const seen = new Map<string, Set<string | null>>();

  const claim = (day: string, hours: string | null) => {
    const existing = seen.get(day);
    if (existing) {
      existing.add(hours);
      return;
    }
    seen.set(day, new Set([hours]));
  };

  const own = nzCalendarDay(ownDate);
  if (own) claim(own, hoursKey(ownDate, ownEndTime));

  for (const extra of extraDates ?? []) {
    const key = toDayInputValue(extra?.date);
    if (!key) continue;

    const hours = hoursKey(extra?.startTime, extra?.endTime);
    const claimed = seen.get(key);

    if (claimed) {
      // No hours of its own means it inherits the parent's, so it is the same
      // sitting all over again rather than a second one.
      if (hours === null) {
        errors.push(
          `${label} already runs on ${readableDay(key)}. Give that extra day its own start and end time to add a second session that day, or remove it.`,
        );
        continue;
      }

      if (claimed.has(hours)) {
        errors.push(
          `${label} runs twice on ${readableDay(key)} at the same time. Change the hours, or remove the duplicate.`,
        );
        continue;
      }
    }

    claim(key, hours);
  }

  return errors;
}

/**
 * Finds extra days that repeat a day the same event or session already runs on.
 *
 * Such a row used to be dropped silently when the page collapsed its date
 * list, taking that day's own hours and location with it. Two *sessions*
 * sharing a day is left alone: a series legitimately runs two workshops on the
 * same afternoon.
 */
export function findDuplicateDays(doc: EventDoc): string[] {
  const errors = findRepeats(
    "This event",
    doc.date,
    doc.endTime,
    doc.extraDates,
  );

  for (const session of doc.sessions ?? []) {
    const title = session?.title?.trim();
    const label = title ? `The session "${title}"` : "This session";

    errors.push(
      ...findRepeats(label, session?.date, session?.endTime, session?.extraDates),
    );
  }

  return errors;
}

/**
 * Rejects the save rather than letting the page quietly discard a day.
 *
 * Runs at document level because a session's extra day has to be compared
 * against its own session, which a field-level validate cannot reach: it sees
 * the row and the whole document, but nothing in between.
 */
export const rejectDuplicateDays: CollectionBeforeValidateHook = ({ data }) => {
  const errors = findDuplicateDays((data ?? {}) as EventDoc);

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  return data;
};
