import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import type { Payload } from "payload";

/** Every place an image can be attached, and how that reads in the admin. */
export const MEDIA_USAGE_SOURCES = [
  { collection: "events", field: "imageMedia", value: "events" },
  { collection: "rockets", field: "imageMedia", value: "rockets" },
  { collection: "rockets", field: "gallery", value: "rockets" },
  { collection: "executives", field: "photoMedia", value: "executives" },
  { collection: "sponsors", field: "logoMedia", value: "sponsors" },
  { collection: "what-we-do", field: "imageMedia", value: "what-we-do" },
  { collection: "journey-items", field: "imageMedia", value: "journey-items" },
] as const;

export const MEDIA_USAGE_OPTIONS = [
  { label: "Events", value: "events" },
  { label: "Rockets", value: "rockets" },
  { label: "Executives", value: "executives" },
  { label: "Sponsors", value: "sponsors" },
  { label: "What We Do", value: "what-we-do" },
  { label: "Journey Items", value: "journey-items" },
  { label: "Site Settings", value: "site-settings" },
];

/**
 * Which parts of the site currently use a given image.
 *
 * Read straight from the relation columns rather than trusted from a cached
 * field, so it cannot describe a state that no longer exists. Drafts count:
 * an image attached to an unpublished event is still in use, and deleting it
 * would break that event the moment it is published.
 */
export async function computeMediaUsage(
  payload: Payload,
  mediaId: number | string,
): Promise<string[]> {
  const used = new Set<string>();

  await Promise.all(
    MEDIA_USAGE_SOURCES.map(async (source) => {
      // Already recorded by a sibling field on the same collection.
      if (used.has(source.value)) return;

      const result = await payload.find({
        collection: source.collection as never,
        where: { [source.field]: { equals: mediaId } } as never,
        limit: 1,
        depth: 0,
        pagination: false,
        draft: true,
      });

      if (result.totalDocs > 0) used.add(source.value);
    }),
  );

  // The one global, which `find` cannot be pointed at.
  const settings = await payload.findGlobal({
    slug: "site-settings" as never,
    depth: 0,
  });
  const settingsImage = (settings as Record<string, unknown>)
    ?.execTeamImageMedia;
  const settingsImageId =
    settingsImage && typeof settingsImage === "object"
      ? (settingsImage as { id?: unknown }).id
      : settingsImage;

  if (settingsImageId !== undefined && String(settingsImageId) === String(mediaId)) {
    used.add("site-settings");
  }

  return MEDIA_USAGE_OPTIONS.map((option) => option.value).filter((value) =>
    used.has(value),
  );
}

/** Writes the computed usage back onto the media document. */
async function refreshMediaUsage(
  payload: Payload,
  mediaId: number | string | null | undefined,
): Promise<void> {
  if (mediaId === null || mediaId === undefined) return;

  try {
    const usedIn = await computeMediaUsage(payload, mediaId);

    await payload.update({
      collection: "media" as never,
      id: mediaId as never,
      data: { usedIn } as never,
      depth: 0,
      // Media has no drafts, and this is bookkeeping rather than an edit, so
      // it must not spawn revalidation or another usage pass.
      context: { skipUsageRefresh: true },
    });
  } catch (error) {
    // Never block saving a document over a bookkeeping field. The worst case
    // is a stale badge in the Media list.
    console.error(`[media-usage] Could not refresh media ${mediaId}:`, error);
  }
}

/**
 * Refreshes usage for a handful of relation values, used by the one global
 * that holds an image and so has no collection hook to hang off.
 */
export async function refreshMediaUsageFor(
  payload: Payload,
  values: unknown[],
): Promise<void> {
  const ids = new Set(values.flatMap((value) => readRelationIds(value)));

  for (const id of ids) {
    await refreshMediaUsage(payload, id);
  }
}

function readRelationIds(value: unknown): (number | string)[] {
  if (value === null || value === undefined) return [];

  const items = Array.isArray(value) ? value : [value];

  return items
    .map((item) =>
      item && typeof item === "object"
        ? ((item as { id?: number | string }).id ?? null)
        : (item as number | string),
    )
    .filter((id): id is number | string => id !== null && id !== undefined);
}

/**
 * Keeps `media.usedIn` current when a document that references an image is
 * saved or deleted.
 *
 * Both the new and the previous values are refreshed, so swapping an image
 * clears the badge from the one that was dropped as well as adding it to the
 * one just chosen.
 */
export function createMediaUsageHook(
  relationFields: string[],
): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req, context }) => {
    if (context?.skipUsageRefresh) return doc;

    const affected = new Set<number | string>();

    for (const field of relationFields) {
      readRelationIds((doc as Record<string, unknown>)?.[field]).forEach((id) =>
        affected.add(id),
      );
      readRelationIds(
        (previousDoc as Record<string, unknown>)?.[field],
      ).forEach((id) => affected.add(id));
    }

    for (const id of affected) {
      await refreshMediaUsage(req.payload, id);
    }

    return doc;
  };
}

export function createMediaUsageDeleteHook(
  relationFields: string[],
): CollectionAfterDeleteHook {
  return async ({ doc, req }) => {
    for (const field of relationFields) {
      for (const id of readRelationIds(
        (doc as Record<string, unknown>)?.[field],
      )) {
        await refreshMediaUsage(req.payload, id);
      }
    }

    return doc;
  };
}
