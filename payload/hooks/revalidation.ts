import { revalidatePath, revalidateTag } from "next/cache.js";

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

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

/**
 * `revalidateTag` and `revalidatePath` only work inside a Next request or
 * static-generation context, and throw an invariant anywhere else.
 *
 * That matters more than it looks, because Payload runs afterChange hooks
 * inside the write's transaction. An unguarded throw here does not just skip
 * the cache bust, it rolls the content change back, so an editor's save would
 * be rejected because cache plumbing was unavailable. It also makes any Local
 * API write from outside Next (a seed, a backfill, a cron) impossible.
 *
 * Cache invalidation is best-effort by nature and everything it backs carries
 * a 300s revalidate window, so the worst case of a swallowed failure is content
 * that is briefly stale. That is strictly better than a rejected save. The warn
 * keeps it visible rather than silent.
 */
function attemptRevalidate(description: string, run: () => void): void {
  try {
    run();
  } catch (error) {
    console.warn(
      `[revalidation] skipped ${description}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

export function revalidateTags(tags: Array<string | null | undefined>): void {
  for (const tag of tags) {
    if (isNonEmptyString(tag)) {
      attemptRevalidate(`tag "${tag}"`, () => revalidateTag(tag, "max"));
    }
  }
}

export function revalidatePaths(paths: Array<string | null | undefined>): void {
  for (const path of paths) {
    if (isNonEmptyString(path)) {
      attemptRevalidate(`path "${path}"`, () => revalidatePath(path));
    }
  }
}

/**
 * Busts a path and everything nested under its layout. Separate from
 * `revalidatePaths` because it needs Next's second argument, and it carries the
 * same guard so a global's save cannot be rolled back by cache plumbing.
 */
export function revalidateLayout(path: string): void {
  attemptRevalidate(`layout "${path}"`, () => revalidatePath(path, "layout"));
}

export function revalidateAboutContent(): void {
  revalidateTags(["about"]);
  revalidatePaths(["/about"]);
}
