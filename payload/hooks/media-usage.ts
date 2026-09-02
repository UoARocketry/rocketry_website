import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from "payload";

/** Every place an image can be attached, and how that reads in the admin. */
export const MEDIA_USAGE_SOURCES = [
  { collection: "events", field: "imageMedia", value: "events" },
  { collection: "events", field: "gallery", value: "events" },
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

type MediaId = number | string;

/**
 * Sources grouped so one query covers a collection however many fields on it
 * can hold an image — `rockets` holds both a cover and a gallery.
 */
const SOURCES_BY_COLLECTION = MEDIA_USAGE_SOURCES.reduce<
  Map<string, { field: string; value: string }[]>
>((grouped, source) => {
  const existing = grouped.get(source.collection) ?? [];
  existing.push({ field: source.field, value: source.value });
  grouped.set(source.collection, existing);
  return grouped;
}, new Map());

/**
 * Which parts of the site currently use each of the given images.
 *
 * Read straight from the relation columns rather than trusted from a cached
 * field, so it cannot describe a state that no longer exists. Drafts count: an
 * image attached to an unpublished event is still in use, and deleting it
 * would break that event the moment it is published.
 *
 * Takes the whole set of images at once. A rocket save touches its cover and
 * its entire gallery, and asking per image meant one query per source per
 * image — a storm of round-trips with the caller's transaction held open
 * behind it.
 */
export async function computeMediaUsage(
  req: PayloadRequest,
  mediaIds: readonly MediaId[],
): Promise<Map<string, string[]>> {
  const wanted = new Map<string, MediaId>();
  for (const id of mediaIds) wanted.set(String(id), id);

  if (wanted.size === 0) return new Map();

  const used = new Map<string, Set<string>>();
  for (const key of wanted.keys()) used.set(key, new Set());

  const ids = [...wanted.values()];

  for (const [collection, sources] of SOURCES_BY_COLLECTION) {
    const result = await req.payload.find({
      collection: collection as never,
      where: {
        or: sources.map((source) => ({ [source.field]: { in: ids } })),
      } as never,
      limit: 0,
      depth: 0,
      pagination: false,
      draft: true,
      // Binds the read to the caller's transaction. Without it Payload opens a
      // second connection, which then contends with the very rows the caller
      // is midway through writing.
      req,
    });

    for (const doc of result.docs) {
      for (const source of sources) {
        const attached = readRelationIds(
          (doc as Record<string, unknown>)[source.field],
        );

        for (const id of attached) {
          used.get(String(id))?.add(source.value);
        }
      }
    }
  }

  // The one global, which `find` cannot be pointed at.
  const settings = await req.payload.findGlobal({
    slug: "site-settings" as never,
    depth: 0,
    req,
  });
  const settingsImage = (settings as Record<string, unknown>)
    ?.execTeamImageMedia;

  for (const id of readRelationIds(settingsImage)) {
    used.get(String(id))?.add("site-settings");
  }

  const order = MEDIA_USAGE_OPTIONS.map((option) => option.value);

  return new Map(
    [...used].map(([key, values]) => [
      key,
      order.filter((value) => values.has(value)),
    ]),
  );
}

/**
 * Writes the computed usage back onto each media document.
 *
 * Errors are deliberately *not* swallowed. This runs inside the caller's
 * transaction, so a failure here has already poisoned it — catching and
 * carrying on let Payload commit a dead transaction, which Postgres accepts as
 * a no-op. The save then reported success and wrote nothing. Better a visible
 * error on an image-bookkeeping field than a silently discarded edit.
 */
async function writeMediaUsage(
  req: PayloadRequest,
  mediaIds: readonly MediaId[],
): Promise<void> {
  const usage = await computeMediaUsage(req, mediaIds);

  for (const id of dedupe(mediaIds)) {
    await req.payload.update({
      collection: "media" as never,
      id: id as never,
      data: { usedIn: usage.get(String(id)) ?? [] } as never,
      depth: 0,
      req,
      // Media has no drafts, and this is bookkeeping rather than an edit, so
      // it must not spawn revalidation or another usage pass.
      context: { skipUsageRefresh: true },
    });
  }
}

function dedupe(ids: readonly MediaId[]): MediaId[] {
  const seen = new Map<string, MediaId>();
  for (const id of ids) seen.set(String(id), id);
  return [...seen.values()];
}

/**
 * Refreshes usage for a handful of relation values, used by the one global
 * that holds an image and so has no collection hook to hang off.
 */
export async function refreshMediaUsageFor(
  req: PayloadRequest,
  values: unknown[],
): Promise<void> {
  await writeMediaUsage(req, values.flatMap((value) => readRelationIds(value)));
}

function readRelationIds(value: unknown): MediaId[] {
  if (value === null || value === undefined) return [];

  const items = Array.isArray(value) ? value : [value];

  return items
    .map((item) =>
      item && typeof item === "object"
        ? ((item as { id?: MediaId }).id ?? null)
        : (item as MediaId),
    )
    .filter((id): id is MediaId => id !== null && id !== undefined);
}

function collectRelationIds(
  relationFields: readonly string[],
  docs: readonly unknown[],
): MediaId[] {
  return docs.flatMap((doc) =>
    relationFields.flatMap((field) =>
      readRelationIds((doc as Record<string, unknown> | undefined)?.[field]),
    ),
  );
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

    await writeMediaUsage(
      req,
      collectRelationIds(relationFields, [doc, previousDoc]),
    );

    return doc;
  };
}

export function createMediaUsageDeleteHook(
  relationFields: string[],
): CollectionAfterDeleteHook {
  return async ({ doc, req }) => {
    await writeMediaUsage(req, collectRelationIds(relationFields, [doc]));

    return doc;
  };
}
