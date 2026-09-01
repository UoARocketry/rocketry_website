import { APIError } from "payload";
import type { CollectionBeforeDeleteHook } from "payload";

export type ReferenceCheck = {
  /** Collection that may point at the document being deleted. */
  collection: string;
  /** Relationship or upload field on that collection holding the reference. */
  field: string;
  /** Human name for that collection, used in the error message. */
  label: string;
};

type ReferenceGuardOptions = {
  checks: ReferenceCheck[];
  /** Noun for the thing being deleted, e.g. "image" or "sponsor tier". */
  subject: string;
};

/**
 * Blocks deleting a document that other documents still point at, and names
 * what is using it.
 *
 * This matters more than usual here because of the flattened-URL pattern:
 * deleting a media row nulls the `*Media` relation but leaves the `image` /
 * `photo` / `logo` text URL pointing at an object that no longer exists, so
 * the site silently degrades to the "Image unavailable" panel with nothing
 * warning the person who deleted it. Same shape for sponsor tiers, where the
 * sponsors in a deleted tier vanish from the page entirely.
 */
export function createReferenceGuardHook({
  checks,
  subject,
}: ReferenceGuardOptions): CollectionBeforeDeleteHook {
  return async ({ id, req }) => {
    const { payload } = req;
    const blockers: string[] = [];

    for (const check of checks) {
      const result = await payload.find({
        collection: check.collection as never,
        where: { [check.field]: { equals: id } },
        // Drafts count: an unpublished document still holds the reference and
        // would break the moment someone published it.
        draft: true,
        depth: 0,
        limit: 5,
        req,
      });

      if (result.totalDocs > 0) {
        const names = result.docs
          .map((doc) => {
            const record = doc as Record<string, unknown>;
            const title = record.title ?? record.name ?? record.label ?? record.id;
            return String(title);
          })
          .join(", ");

        const overflow =
          result.totalDocs > result.docs.length
            ? ` and ${result.totalDocs - result.docs.length} more`
            : "";

        blockers.push(`${check.label}: ${names}${overflow}`);
      }
    }

    if (blockers.length > 0) {
      throw new APIError(
        `This ${subject} is still in use, so deleting it would break those pages. Remove it from the following first, then delete it. ${blockers.join(" | ")}`,
        400,
        undefined,
        true,
      );
    }
  };
}
