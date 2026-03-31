import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import {
  getStringField,
  revalidatePaths,
  revalidateTags,
} from "../hooks/revalidation.ts";

export const Rockets: CollectionConfig = {
  slug: "rockets",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "launchedAt"],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: isPublicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        const currentSlug = getStringField(doc, "slug");
        const previousSlug = getStringField(previousDoc, "slug");

        revalidateTags([
          "rockets",
          currentSlug ? `rocket:${currentSlug}` : null,
          previousSlug && previousSlug !== currentSlug
            ? `rocket:${previousSlug}`
            : null,
        ]);

        revalidatePaths([
          "/",
          "/rockets",
          currentSlug ? `/rockets/${currentSlug}` : null,
          previousSlug && previousSlug !== currentSlug
            ? `/rockets/${previousSlug}`
            : null,
        ]);
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const deletedSlug = getStringField(doc, "slug");

        revalidateTags([
          "rockets",
          deletedSlug ? `rocket:${deletedSlug}` : null,
        ]);

        revalidatePaths([
          "/",
          "/rockets",
          deletedSlug ? `/rockets/${deletedSlug}` : null,
        ]);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "image", type: "text", required: false },
    { name: "description", type: "textarea", required: false },
    { name: "launchedAt", type: "date", required: false },
  ],
};
