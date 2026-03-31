const DEFAULT_LOCALE = "en-US";

const normalizeWhitespace = (value: string) =>
  value.trim().replace(/\s+/g, " ");

export const ALL_EVENTS_TAG = "all";

export function formatDateShort(date: string | Date, locale = DEFAULT_LOCALE) {
  return new Date(date).toLocaleDateString(locale);
}

export function formatDateLong(date: string | Date, locale = DEFAULT_LOCALE) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateWithTime(
  date: string | Date,
  locale = DEFAULT_LOCALE,
) {
  return new Date(date).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
