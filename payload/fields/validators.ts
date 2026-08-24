function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

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
