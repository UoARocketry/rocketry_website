import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";

const DEFAULT_MEDIA_PREFIX = "media";

export function resolveMediaPrefix(existingPrefix: unknown): string {
  if (typeof existingPrefix === "string" && existingPrefix.trim().length > 0) {
    return existingPrefix.trim();
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
      ({ data }) => {
        if (!data || typeof data !== "object") {
          return data;
        }
        const nextData = data as Record<string, unknown>;
        nextData.prefix = resolveMediaPrefix(nextData.prefix);
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
