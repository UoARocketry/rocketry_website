import type { CollectionBeforeValidateHook } from "payload";
import { toDayInputValue } from "../../lib/day-date.ts";
import { nzCalendarDay } from "../../lib/utils.ts";

type DayRow = { date?: string | null };

type SessionRow = {
  title?: string | null;
  date?: string | null;
  extraDates?: DayRow[] | null;
};

type EventDoc = {
  date?: string | null;
  extraDates?: DayRow[] | null;
  sessions?: SessionRow[] | null;
};

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
  extraDates: DayRow[] | null | undefined,
): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  const own = nzCalendarDay(ownDate);
  if (own) seen.add(own);

  for (const extra of extraDates ?? []) {
    const key = toDayInputValue(extra?.date);
    if (!key) continue;

    if (key === own) {
      errors.push(
        `${label} already runs on ${readableDay(key)}. Remove that extra day, or change it to a different day.`,
      );
      continue;
    }

    if (seen.has(key)) {
      errors.push(
        `${label} lists ${readableDay(key)} twice. Each extra day must be a different day.`,
      );
      continue;
    }

    seen.add(key);
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
  const errors = findRepeats("This event", doc.date, doc.extraDates);

  for (const session of doc.sessions ?? []) {
    const title = session?.title?.trim();
    const label = title ? `The session "${title}"` : "This session";

    errors.push(...findRepeats(label, session?.date, session?.extraDates));
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
