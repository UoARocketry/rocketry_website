/**
 * Conversion for dates that are a calendar day and nothing else.
 *
 * Payload's own `dayOnly` picker cannot be used here. It timezone-corrects
 * when it writes but not when it reads, so at UTC+12 the stored instant falls
 * on the next calendar day and the admin redisplays every date one day late:
 * click the 20th, reopen the document, and it reads the 21st. See
 * `DayOnlyDateField`, which replaces it with a native input that has no
 * timezone at all.
 *
 * A day is stored as **noon UTC** of that day. Noon is far enough from either
 * midnight that no real timezone can drag it onto a neighbouring date, and it
 * is the convention already in the database, so nothing needs migrating.
 */

/** Exactly YYYY-MM-DD, which is what `<input type="date">` speaks. */
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toValidDate(value: string | Date): Date | null {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** The calendar day a stored value stands for, ready for a date input. */
export function toDayInputValue(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";

  const parsed = toValidDate(value);
  if (!parsed) return "";

  const year = String(parsed.getUTCFullYear()).padStart(4, "0");
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** The instant to store for a day the editor picked. */
export function fromDayInputValue(
  value: string | null | undefined,
): string | null {
  if (!value || !DAY_PATTERN.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day, 12));

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
