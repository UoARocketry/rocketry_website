import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import {
  getStringField,
  revalidatePaths,
  revalidateTags,
} from "../hooks/revalidation.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { validateOptionalUrl } from "../fields/validators.ts";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "eventTag"],
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
    beforeChange: [
      createMediaRelationUrlSyncHook({
        relationField: "imageMedia",
        urlField: "image",
      }),
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
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
      ({ doc }) => {
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
    {
      name: "imageMedia",
      type: "upload",
      relationTo: "media" as never,
      required: false,
      admin: {
        description:
          "Upload or select an image. This auto-fills the Event image URL.",
      },
    },
    {
      name: "image",
      type: "text",
      required: false,
      validate: (value: unknown) =>
        validateOptionalUrl(value, "Event image URL"),
      admin: {
        description:
          "Auto-filled from the upload above whenever a file is selected there (overwrites this field on save). Leave the upload empty to link an external image URL directly instead.",
      },
    },
    { name: "description", type: "textarea", required: true },
    { name: "date", type: "date", required: true },
    {
      name: "eventTag",
      type: "relationship",
      relationTo: "event-tags" as never,
      required: false,
      admin: {
        description: "Manage the available tags in the Event Tags collection.",
      },
    },
    {
      name: "signupUrl",
      type: "text",
      required: false,
      validate: (value: unknown) => validateOptionalUrl(value, "Signup URL"),
    },
    { name: "location", type: "text", required: false },
    {
      name: "sessions",
      type: "array",
      required: false,
      labels: { singular: "Session", plural: "Sessions" },
      admin: {
        description:
          "Optional. For a multi-session series (e.g. Level 1 build workshops), add each session in the order they run. Leave empty for a normal one-off event.",
      },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "date", type: "date", required: true },
        { name: "description", type: "textarea", required: false },
        {
          name: "location",
          type: "text",
          required: false,
          admin: {
            description:
              "Optional. Falls back to the event location above if left empty.",
          },
        },
      ],
    },
  ],
};
