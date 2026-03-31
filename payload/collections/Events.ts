import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import {
  getStringField,
  revalidatePaths,
  revalidateTags,
} from "../hooks/revalidation.ts";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "eventTag", "isPast"],
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
      async ({ doc, previousDoc }) => {
        const currentSlug = getStringField(doc, "slug");
        const previousSlug = getStringField(previousDoc, "slug");

        revalidateTags([
          "events",
          currentSlug ? `event:${currentSlug}` : null,
          previousSlug && previousSlug !== currentSlug
            ? `event:${previousSlug}`
            : null,
        ]);

        revalidatePaths([
          "/",
          "/events",
          currentSlug ? `/events/${currentSlug}` : null,
          previousSlug && previousSlug !== currentSlug
            ? `/events/${previousSlug}`
            : null,
        ]);
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const deletedSlug = getStringField(doc, "slug");

        revalidateTags(["events", deletedSlug ? `event:${deletedSlug}` : null]);
        revalidatePaths([
          "/",
          "/events",
          deletedSlug ? `/events/${deletedSlug}` : null,
        ]);
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "image", type: "text", required: false },
    { name: "description", type: "textarea", required: true },
    { name: "date", type: "date", required: true },
    { name: "eventTag", type: "text", required: false },
    { name: "signupUrl", type: "text", required: false },
    { name: "isPast", type: "checkbox", required: true, defaultValue: false },
    { name: "location", type: "text", required: false },
  ],
};
