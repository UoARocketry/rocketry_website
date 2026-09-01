function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

import type { FieldHook } from "payload";

/** Straight and curly quotes, as pasted from a chat app or a document. */
const WRAPPING_QUOTES = /^["'‘’“”]+|["'‘’“”]+$/g;

/** Any scheme at all, e.g. "https:", "mailto:". */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** A dotted host with a plausible TLD, before any path or port. */
const LOOKS_LIKE_HOST = /^[^\s/:@]+\.[a-z]{2,}(?=$|[/:?#])/i;

/**
 * Repairs the way people actually paste links, so the field self-heals instead
 * of scolding.
 *
 * Instagram and Linktree display links without a scheme ("tr.ee/DKA8yiAigc"),
 * and `new URL` cannot parse those, so the bare form was rejected as invalid
 * with no hint as to why. A scheme-less value would also be wrong if stored:
 * `href="tr.ee/x"` is a relative path, sending visitors to
 * uoarocketry.com/tr.ee/x.
 *
 * Deliberately conservative. An existing scheme is never rewritten — upgrading
 * http to https would be changing someone's intent — and anything without a
 * dotted host is left exactly as typed so validation can still reject it.
 * Prepending a scheme to prose would turn an obvious mistake into a
 * plausible-looking dead link.
 */
export function normalizeUrlValue(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const trimmed = value.trim().replace(WRAPPING_QUOTES, "");

  if (!trimmed) return value;
  if (HAS_SCHEME.test(trimmed)) return trimmed;
  if (!LOOKS_LIKE_HOST.test(trimmed)) return value;

  return `https://${trimmed}`;
}

/**
 * Attach to every URL field so the repair happens before validation and the
 * corrected value is what gets stored.
 */
export const urlFieldHooks: { beforeValidate: FieldHook[] } = {
  beforeValidate: [({ value }: { value?: unknown }) => normalizeUrlValue(value)],
};

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateOptionalUrl(
  value: unknown,
  fieldLabel = "URL",
): true | string {
  if (!isNonEmptyString(value)) {
    return true;
  }

  return isValidUrl(value) || `${fieldLabel} must be a valid http(s) URL.`;
}

export function validateRequiredUrl(
  value: unknown,
  fieldLabel = "URL",
): true | string {
  if (!isNonEmptyString(value)) {
    return `${fieldLabel} is required.`;
  }

  return isValidUrl(value) || `${fieldLabel} must be a valid http(s) URL.`;
}

/**
 * For URL fields that are auto-filled from a sibling upload relation by a
 * `beforeChange` hook.
 *
 * Marking such a field `required` does not work: Payload validates fields
 * *before* running `beforeChange`, so a freshly uploaded file fails validation
 * even though the URL is about to be populated. This accepts either source and
 * only complains when both are genuinely empty.
 */
export function validateUrlOrUpload(
  value: unknown,
  siblingData: unknown,
  relationField: string,
  fieldLabel = "URL",
): true | string {
  if (isNonEmptyString(value)) {
    return isValidUrl(value) || `${fieldLabel} must be a valid http(s) URL.`;
  }

  const sibling =
    siblingData && typeof siblingData === "object"
      ? (siblingData as Record<string, unknown>)
      : {};
  const relationValue = sibling[relationField];
  const hasUpload =
    relationValue !== null && relationValue !== undefined && relationValue !== "";

  return (
    hasUpload ||
    `${fieldLabel} is required — either upload a file above or paste an image URL here.`
  );
}
