import type { CollectionConfig, PayloadRequest } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";

const DEFAULT_MEDIA_PREFIX = "media";
const MAX_DECODE_ITERATIONS = 4;

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function normalizeSlug(value: string): string | null {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
  if (!normalized || !/^[a-z0-9-]+$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function getRefererHeader(req: PayloadRequest): string | null {
  const headers = req.headers as unknown;

  if (headers instanceof Headers) {
    return asNonEmptyString(headers.get("referer"));
  }

  if (!headers || typeof headers !== "object") {
    return null;
  }

  const headerRecord = headers as Record<string, unknown>;
  return (
    asNonEmptyString(headerRecord.referer) ??
    asNonEmptyString(headerRecord.Referrer) ??
    null
  );
}

function getConfiguredOwnerSlugs(req: PayloadRequest): Set<string> {
  const ownerSlugs = new Set<string>();
  const payloadConfig = req.payload?.config as
    | {
        collections?: Array<{ slug?: string }>;
        globals?: Array<{ slug?: string }>;
      }
    | undefined;

  for (const collection of payloadConfig?.collections ?? []) {
    const slug = asNonEmptyString(collection.slug);
    if (!slug) {
      continue;
    }

    ownerSlugs.add(slug.toLowerCase());
  }

  for (const global of payloadConfig?.globals ?? []) {
    const slug = asNonEmptyString(global.slug);
    if (!slug) {
      continue;
    }

    ownerSlugs.add(slug.toLowerCase());
  }

  return ownerSlugs;
}

function addCandidate(
  candidates: string[],
  seenCandidates: Set<string>,
  value: unknown,
): void {
  const candidate = asNonEmptyString(value);
  if (!candidate || seenCandidates.has(candidate)) {
    return;
  }

  seenCandidates.add(candidate);
  candidates.push(candidate);
}

function getRequestCandidates(req: PayloadRequest): string[] {
  const candidates: string[] = [];
  const seenCandidates = new Set<string>();

  addCandidate(candidates, seenCandidates, getRefererHeader(req));

  const requestRecord = req as {
    originalUrl?: unknown;
    query?: unknown;
    url?: unknown;
  };

  addCandidate(candidates, seenCandidates, requestRecord.url);
  addCandidate(candidates, seenCandidates, requestRecord.originalUrl);

  const query = requestRecord.query;
  if (query && typeof query === "object") {
    for (const value of Object.values(query as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          addCandidate(candidates, seenCandidates, item);
        }
        continue;
      }

      addCandidate(candidates, seenCandidates, value);
    }
  }

  return candidates;
}

function decodeCandidateVariants(value: string): string[] {
  const variants: string[] = [value];
  const seenVariants = new Set<string>([value]);
  let current = value;

  for (let index = 0; index < MAX_DECODE_ITERATIONS; index += 1) {
    const decoded = safeDecode(current);
    if (!decoded || decoded === current) {
      break;
    }

    if (seenVariants.has(decoded)) {
      break;
    }

    variants.push(decoded);
    seenVariants.add(decoded);
    current = decoded;
  }

  return variants;
}

function extractOwnerSlugFromText(
  text: string,
  allowedSlugs: Set<string>,
): string | null {
  const matches = [
    ...text.matchAll(/\/collections\/([^/?#&]+)/gi),
    ...text.matchAll(/\/globals\/([^/?#&]+)/gi),
  ];

  for (const match of matches) {
    const slug = normalizeSlug(match[1] ?? "");
    if (!slug || slug === DEFAULT_MEDIA_PREFIX) {
      continue;
    }

    if (allowedSlugs.size > 0 && !allowedSlugs.has(slug)) {
      continue;
    }

    return slug;
  }

  const directSlug = normalizeSlug(text);
  if (
    directSlug &&
    directSlug !== DEFAULT_MEDIA_PREFIX &&
    (allowedSlugs.size === 0 || allowedSlugs.has(directSlug))
  ) {
    return directSlug;
  }

  return null;
}

function extractAdminOwnerSlug(
  source: string,
  allowedSlugs: Set<string>,
): string | null {
  for (const variant of decodeCandidateVariants(source)) {
    const directMatch = extractOwnerSlugFromText(variant, allowedSlugs);
    if (directMatch) {
      return directMatch;
    }

    try {
      const parsedUrl = new URL(variant);
      const urlSearchSegments = [
        parsedUrl.pathname,
        parsedUrl.search,
        parsedUrl.hash,
      ];

      for (const segment of urlSearchSegments) {
        for (const segmentVariant of decodeCandidateVariants(segment)) {
          const segmentMatch = extractOwnerSlugFromText(
            segmentVariant,
            allowedSlugs,
          );
          if (segmentMatch) {
            return segmentMatch;
          }
        }
      }

      for (const queryValue of parsedUrl.searchParams.values()) {
        for (const queryVariant of decodeCandidateVariants(queryValue)) {
          const queryMatch = extractOwnerSlugFromText(
            queryVariant,
            allowedSlugs,
          );
          if (queryMatch) {
            return queryMatch;
          }
        }
      }
    } catch {
      // Ignore non-URL candidates and continue checking decoded variants.
    }
  }

  return null;
}

function resolveMediaPrefix(req: PayloadRequest): string {
  const allowedOwnerSlugs = getConfiguredOwnerSlugs(req);

  for (const candidate of getRequestCandidates(req)) {
    const ownerSlug = extractAdminOwnerSlug(candidate, allowedOwnerSlugs);
    if (ownerSlug) {
      return ownerSlug;
    }
  }

  return DEFAULT_MEDIA_PREFIX;
}

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
    group: "Assets",
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data || typeof data !== "object") {
          return data;
        }

        const nextData = data as Record<string, unknown>;
        const existingPrefix = asNonEmptyString(nextData.prefix);

        if (existingPrefix && existingPrefix !== DEFAULT_MEDIA_PREFIX) {
          return nextData;
        }

        nextData.prefix = resolveMediaPrefix(req);
        return nextData;
      },
    ],
  },
  access: {
    read: isPublicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  upload: {
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: false,
    },
  ],
};
