import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import {
  getNumberField,
  revalidatePaths,
  revalidateTags,
} from "../hooks/revalidation.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { validateOptionalUrl } from "../fields/validators.ts";

export const Executives: CollectionConfig = {
  slug: "executives",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "year", "order"],
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
        relationField: "photoMedia",
        urlField: "photo",
      }),
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        const year = getNumberField(doc, "year");
        const previousYear = getNumberField(previousDoc, "year");

        revalidateTags([
          "about",
          "exec",
          "exec-years",
          year !== null ? `exec-year:${year}` : null,
          previousYear !== null && previousYear !== year
            ? `exec-year:${previousYear}`
            : null,
        ]);

        revalidatePaths(["/about"]);
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const year = getNumberField(doc, "year");

        revalidateTags([
          "about",
          "exec",
          "exec-years",
          year !== null ? `exec-year:${year}` : null,
        ]);

        revalidatePaths(["/about"]);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "bio", type: "textarea", required: true },
    {
      name: "photoMedia",
      type: "upload",
      relationTo: "media" as never,
      required: false,
      admin: {
        description:
          "Upload or select a headshot. This auto-fills the Photo URL.",
      },
    },
    {
      name: "photo",
      type: "text",
      required: true,
      admin: {
        description:
          "Auto-filled from the upload above whenever a file is selected there (overwrites this field on save). Leave the upload empty to link an external image URL directly instead.",
      },
    },
    {
      name: "year",
      type: "number",
      required: true,
      index: true,
      defaultValue: () => new Date().getFullYear(),
    },
    { name: "order", type: "number", required: true, defaultValue: 1 },
    {
      name: "linkedinUrl",
      type: "text",
      required: false,
      validate: (value: unknown) => validateOptionalUrl(value, "LinkedIn URL"),
    },
  ],
};
