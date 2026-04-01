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
