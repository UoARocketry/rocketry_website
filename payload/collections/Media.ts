import { APIError } from "payload";
import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { createReferenceGuardHook } from "../hooks/reference-guard.ts";
import { MEDIA_USAGE_OPTIONS } from "../hooks/media-usage.ts";

const DEFAULT_MEDIA_PREFIX = "media";

/** 8 MB. A backstop only: CompressedUpload already shrinks most images
 *  client-side, but it runs in the browser and skips GIFs and anything it
 *  cannot decode, so nothing server-side was enforcing a ceiling. */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function assertWithinSizeLimit(size: unknown): void {
  if (typeof size === "number" && size > MAX_UPLOAD_BYTES) {
    const megabytes = (size / (1024 * 1024)).toFixed(1);
    throw new APIError(
      `That image is ${megabytes} MB, over the ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB limit. Resize or compress it and try again.`,
      400,
      undefined,
      true,
    );
  }
}

/**
 * Formats no browser but Safari will render, so they must never be stored.
 *
 * iPhones shoot HEIC by default. `CompressedUpload` converts one to JPEG in
 * the browser before it is ever sent, so reaching here means that conversion
 * did not run — an unsupported browser, a script failure, or an upload made
 * straight through the API. Without this the file would save happily and then
 * show as a broken image everywhere, which is far harder to diagnose than a
 * refused upload.
 */
const UNDISPLAYABLE_MIME_TYPES = new Set(["image/heic", "image/heif"]);
const UNDISPLAYABLE_EXTENSIONS = /\.(heic|heif)$/i;

export function assertDisplayableImage(
  file: { mimetype?: string; name?: string } | undefined,
): void {
  if (!file) return;

  const mimetype = (file.mimetype ?? "").toLowerCase();
  const name = file.name ?? "";

  // The extension is checked as well because a browser that cannot decode the
  // format often cannot name it either, handing over an empty or generic type.
  if (
    UNDISPLAYABLE_MIME_TYPES.has(mimetype) ||
    UNDISPLAYABLE_EXTENSIONS.test(name)
  ) {
    throw new APIError(
      "That is an iPhone HEIC photo, which most browsers cannot display. It should have been converted automatically — try again, or save it as a JPEG first.",
      400,
      undefined,
      true,
    );
  }
}

export function resolveMediaPrefix(existingPrefix: unknown): string {
  if (typeof existingPrefix === "string" && existingPrefix.trim().length > 0) {
    return existingPrefix.trim();
  }
  return DEFAULT_MEDIA_PREFIX;
}

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["alt", "usedIn", "filename", "updatedAt"],
    group: "Assets",
    description:
      "Every image used across the site. Deleting one is blocked while a page still uses it.",
    components: {
      edit: {
        Upload: "/payload/components/CompressedUpload.tsx#CompressedUpload",
      },
    },
  },
  hooks: {
    beforeValidate: [
      ({ req }) => {
        // Payload 3.80 exposes no filesize option on `upload`, so the ceiling
        // has to be enforced here or not at all.
        assertWithinSizeLimit(req?.file?.size);
        assertDisplayableImage(req?.file);
      },
      ({ data }) => {
        if (!data || typeof data !== "object") {
          return data;
        }
        const nextData = data as Record<string, unknown>;
        nextData.prefix = resolveMediaPrefix(nextData.prefix);
        return nextData;
      },
    ],
    beforeDelete: [
      createReferenceGuardHook({
        subject: "image",
        checks: [
          { collection: "events", field: "imageMedia", label: "Events" },
          { collection: "rockets", field: "imageMedia", label: "Rockets" },
          { collection: "rockets", field: "gallery", label: "Rocket galleries" },
          { collection: "executives", field: "photoMedia", label: "Executives" },
          { collection: "sponsors", field: "logoMedia", label: "Sponsors" },
          { collection: "what-we-do", field: "imageMedia", label: "What We Do" },
          { collection: "journey-items", field: "imageMedia", label: "Journey Items" },
        ],
      }),
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
      name: "usedIn",
      type: "select",
      hasMany: true,
      required: false,
      label: "Used in",
      options: MEDIA_USAGE_OPTIONS,
      admin: {
        // Maintained by hooks on every collection that references an image, so
        // typing here would only be overwritten on the next save.
        readOnly: true,
        description:
          "Filled in automatically. Filter the list by this to find every image used in one part of the site, or leave the filter empty to find images nothing uses.",
      },
    },
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description:
          "Describe the image in a few words, for screen readers and for when the image fails to load. E.g. \"Aurora Mk II on the launch rail\".",
      },
    },
  ],
};
