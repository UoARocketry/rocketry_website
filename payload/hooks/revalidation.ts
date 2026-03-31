import { revalidatePath, revalidateTag } from "next/cache";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function getStringField(doc: unknown, field: string): string | null {
  if (!doc || typeof doc !== "object") {
    return null;
  }

  const candidate = doc as Record<string, unknown>;
  const value = candidate[field];
  return isNonEmptyString(value) ? value : null;
}

export function getNumberField(doc: unknown, field: string): number | null {
  if (!doc || typeof doc !== "object") {
    return null;
  }

  const candidate = doc as Record<string, unknown>;
  const value = candidate[field];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function revalidateTags(tags: Array<string | null | undefined>): void {
  for (const tag of tags) {
    if (isNonEmptyString(tag)) {
      revalidateTag(tag, "max");
    }
  }
}

export function revalidatePaths(paths: Array<string | null | undefined>): void {
  for (const path of paths) {
    if (isNonEmptyString(path)) {
      revalidatePath(path);
    }
  }
}
