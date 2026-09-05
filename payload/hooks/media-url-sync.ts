import type { PayloadRequest } from "payload";

const MEDIA_COLLECTION_SLUG = "media";

type UnknownRecord = Record<string, unknown>;
type MediaSyncHookArgs = {
  data?: unknown;
  originalDoc?: unknown;
  req: PayloadRequest;
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as UnknownRecord;
}

function hasOwn(record: UnknownRecord, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, field);
}

function isEmptyRelationValue(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function getRelationId(value: unknown): number | string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const stringValue = asNonEmptyString(value);
  if (stringValue) {
    return stringValue;
  }

  const record = asRecord(value);
  if (!record || !hasOwn(record, "id")) {
    return null;
  }

  return getRelationId(record.id);
}

function getSupabasePublicBaseUrl(): string | null {
  const configured = asNonEmptyString(process.env.SUPABASE_STORAGE_PUBLIC_URL);
  if (!configured) {
    return null;
  }

  // A misconfigured base (a bare bucket path, say) would otherwise be
  // concatenated into a relative URL and written into the flattened field,
  // which is the exact failure `isAbsoluteUrl` exists to prevent on the other
  // branch. Returning null instead makes the caller keep the existing URL.
  if (!isAbsoluteUrl(configured)) {
    return null;
  }

  return configured.replace(/\/+$/, "");
}

function buildSupabasePublicUrl(
  filename: string,
  prefix?: string | null,
): string | null {
  const baseUrl = getSupabasePublicBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const normalizedPrefix = asNonEmptyString(prefix)?.replace(/^\/+|\/+$/g, "");

  return normalizedPrefix
    ? `${baseUrl}/${normalizedPrefix}/${filename}`
    : `${baseUrl}/${filename}`;
}

/**
 * The flattened URL field is read directly by the public site, so only an
 * absolute URL is safe to store in it.
 *
 * This matters because Payload reports a media doc's `url` as a relative
 * `/api/media/file/...` path whenever the S3 storage plugin is skipped, which
 * is exactly what happens when the `SUPABASE_STORAGE_*` env group is unset —
 * the normal state of a local dev server. Saving a document in that
 * environment against the production database would otherwise overwrite a good
 * Supabase URL with a path that resolves nowhere on the live site.
 */
export function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function extractUrlFromMediaDoc(doc: UnknownRecord): string | null {
  const directUrl = asNonEmptyString(doc.url);
  if (directUrl && isAbsoluteUrl(directUrl)) {
    return directUrl;
  }

  const filename = asNonEmptyString(doc.filename);
  if (!filename) {
    return null;
  }

  const prefix = asNonEmptyString(doc.prefix);

  // Returning null here is deliberate: `syncMediaRelationToUrlField` then keeps
  // whatever URL the document already had rather than replacing it with a
  // worse one.
  return buildSupabasePublicUrl(filename, prefix);
}

async function resolveMediaUrl(
  mediaValue: unknown,
  req: PayloadRequest,
): Promise<string | null> {
  const embeddedDoc = asRecord(mediaValue);
  if (embeddedDoc) {
    const embeddedUrl = extractUrlFromMediaDoc(embeddedDoc);
    if (embeddedUrl) {
      return embeddedUrl;
    }
  }

  const relationId = getRelationId(mediaValue);
  if (relationId === null) {
    return null;
  }

  try {
    const mediaDoc = (await req.payload.findByID({
      collection: MEDIA_COLLECTION_SLUG as never,
      id: relationId,
      depth: 0,
    })) as unknown as UnknownRecord;

    return extractUrlFromMediaDoc(mediaDoc);
  } catch {
    return null;
  }
}

type SyncMediaUrlFieldOptions = {
  data: UnknownRecord;
  originalDoc?: unknown;
  req: PayloadRequest;
  relationField: string;
  urlField: string;
  clearUrlWhenRelationCleared?: boolean;
};

export async function syncMediaRelationToUrlField({
  data,
  originalDoc,
  req,
  relationField,
  urlField,
  clearUrlWhenRelationCleared = true,
}: SyncMediaUrlFieldOptions): Promise<void> {
  const previousDoc = asRecord(originalDoc);
  const relationProvided = hasOwn(data, relationField);
  const urlProvided = hasOwn(data, urlField);
  const relationValue = relationProvided
    ? data[relationField]
    : previousDoc?.[relationField];

  const relationCleared =
    relationProvided && isEmptyRelationValue(relationValue);

  if (isEmptyRelationValue(relationValue)) {
    if (relationCleared && clearUrlWhenRelationCleared && !urlProvided) {
      data[urlField] = null;
    }

    return;
  }

  const resolvedUrl = await resolveMediaUrl(relationValue, req);
  if (resolvedUrl) {
    data[urlField] = resolvedUrl;
    return;
  }

  if (!urlProvided && previousDoc && hasOwn(previousDoc, urlField)) {
    data[urlField] = previousDoc[urlField] ?? null;
  }
}

type MediaUrlSyncHookConfig = {
  relationField: string;
  urlField: string;
  clearUrlWhenRelationCleared?: boolean;
};

export function createMediaRelationUrlSyncHook({
  relationField,
  urlField,
  clearUrlWhenRelationCleared,
}: MediaUrlSyncHookConfig) {
  return async ({
    data,
    originalDoc,
    req,
  }: MediaSyncHookArgs): Promise<UnknownRecord> => {
    const nextData = asRecord(data) ?? {};

    await syncMediaRelationToUrlField({
      data: nextData,
      originalDoc,
      req,
      relationField,
      urlField,
      clearUrlWhenRelationCleared,
    });

    return nextData;
  };
}
