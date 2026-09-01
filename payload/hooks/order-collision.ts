import type {
  BasePayload,
  CollectionAfterChangeHook,
  PayloadRequest,
  Where,
} from "payload";

export type OrderedRow = {
  id: number | string;
  order: number;
};

function compareIds(a: number | string, b: number | string): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return String(a).localeCompare(String(b));
}

/**
 * Works out the rows whose `order` must change so that `movedId` sits at
 * `targetOrder` within its group, with the group renumbered `1..n`.
 *
 * Pure and idempotent: feeding it an already-correct group returns an empty
 * array, which is what lets a failed run heal itself on the next publish.
 *
 * `rows` is the whole group including the moved row. A moved row that is not
 * in `rows` is treated as a new entrant and is never returned, because the
 * caller has already written it.
 */
export function resolveOrder(
  rows: readonly OrderedRow[],
  movedId: number | string,
  targetOrder: number,
): OrderedRow[] {
  const others = rows
    .filter((row) => row.id !== movedId)
    .sort((a, b) => a.order - b.order || compareIds(a.id, b.id));

  // Truncate first so "2.7" cannot land between two positions, then clamp into
  // the only range that produces a contiguous sequence.
  const requested = Math.trunc(targetOrder) || 1;
  const clamped = Math.min(Math.max(requested, 1), others.length + 1);

  const sequence: OrderedRow[] = [...others];
  sequence.splice(clamped - 1, 0, { id: movedId, order: clamped });

  const originalOrders = new Map(rows.map((row) => [row.id, row.order]));

  const changed: OrderedRow[] = [];
  sequence.forEach((row, index) => {
    const nextOrder = index + 1;
    const previousOrder = originalOrders.get(row.id);

    // Absent from the group means a brand new row the caller just wrote.
    if (previousOrder === undefined) {
      return;
    }
    if (previousOrder !== nextOrder) {
      changed.push({ id: row.id, order: nextOrder });
    }
  });

  return changed;
}

/**
 * Copies a shifted row's new `order` onto its latest version row.
 *
 * `payload.db.updateOne` writes the main table only, which is what the public
 * site reads, so the site was always correct. The admin list view is
 * draft-aware and reads the latest version instead, so without this the list
 * showed a shifted document's old position — the admin quietly disagreeing
 * with the site, which invites someone to "fix" numbers that are already right.
 *
 * Patching the latest version also stops a pending draft from reverting the
 * reorder the moment it is published. Only `order` is touched; every other
 * field on that version is left exactly as it was.
 */
async function syncLatestVersionOrder({
  payload,
  slug,
  parentId,
  order,
  req,
}: {
  payload: BasePayload;
  slug: string;
  parentId: number | string;
  order: number;
  req: PayloadRequest;
}): Promise<void> {
  const found = await payload.db.findVersions({
    collection: slug as never,
    where: { parent: { equals: parentId }, latest: { equals: true } },
    limit: 1,
    req,
  });

  const latest = found.docs?.[0] as
    | {
        id: number | string;
        parent: number | string;
        latest?: boolean;
        createdAt: string;
        updatedAt: string;
        version: Record<string, unknown>;
      }
    | undefined;

  if (!latest?.version) {
    return;
  }

  await payload.db.updateVersion({
    collection: slug as never,
    id: latest.id,
    versionData: {
      createdAt: latest.createdAt,
      latest: latest.latest,
      parent: latest.parent,
      updatedAt: latest.updatedAt,
      version: { ...latest.version, order },
    },
    req,
    returning: false,
  });
}

type OrderCollisionOptions = {
  /**
   * Field that partitions the collection into independent ordering groups.
   * Executives order within a `year`; everything else orders globally.
   */
  scopeField?: string;
};

/**
 * Keeps a collection's `order` field a contiguous `1..n` sequence with no
 * duplicates, shifting siblings out of the way when a document claims an
 * occupied position.
 *
 * Only published documents take part. A draft can therefore never reorder the
 * live site, and the shift is applied with `payload.db.updateOne`, which writes
 * the column directly: it fires no hooks (so this cannot recurse) and creates
 * no version, so a sibling's pending draft is never published as a side effect.
 *
 * Collections without drafts have no `_status`, so for those every save counts
 * as published.
 */
export function createOrderCollisionHook(
  options: OrderCollisionOptions = {},
): CollectionAfterChangeHook {
  const { scopeField } = options;

  return async ({ collection, doc, req }) => {
    const { payload } = req;
    const slug = collection.slug;

    const versions = collection.versions;
    const hasDrafts =
      typeof versions === "object" && versions !== null && Boolean(versions.drafts);

    if (hasDrafts && doc?._status !== "published") {
      return doc;
    }

    const targetOrder = Number(doc?.order);
    if (!Number.isFinite(targetOrder)) {
      return doc;
    }

    try {
      const where: Where = {};
      if (hasDrafts) {
        where._status = { equals: "published" };
      }
      if (scopeField) {
        // A group is only comparable within the same scope value, and a null
        // scope would otherwise sweep in every other group's rows.
        const scopeValue = doc?.[scopeField] as
          | boolean
          | number
          | string
          | null
          | undefined;
        if (scopeValue === undefined || scopeValue === null) {
          return doc;
        }
        where[scopeField] = { equals: scopeValue };
      }

      const existing = await payload.find({
        collection: slug,
        where,
        pagination: false,
        depth: 0,
        sort: "order",
        req,
      });

      const rows: OrderedRow[] = existing.docs
        .map((row) => ({
          id: (row as { id: number | string }).id,
          order: Number((row as { order?: unknown }).order),
        }))
        .filter((row) => Number.isFinite(row.order));

      const changes = resolveOrder(rows, doc.id, targetOrder);

      for (const change of changes) {
        await payload.db.updateOne({
          collection: slug,
          id: change.id,
          data: { order: change.order },
          req,
          returning: false,
        });

        if (hasDrafts) {
          await syncLatestVersionOrder({
            payload,
            slug,
            parentId: change.id,
            order: change.order,
            req,
          });
        }
      }
    } catch (err) {
      // Deliberately non-fatal: the document itself saved correctly, and
      // `resolveOrder` is idempotent, so the next publish in this group
      // repairs the sequence. Logged loudly so it is not invisible.
      payload.logger.error({
        err,
        msg: `Order collision resolution failed for ${slug} document ${String(doc?.id)}. Ordering will be repaired on the next publish in this group.`,
      });
    }

    return doc;
  };
}
