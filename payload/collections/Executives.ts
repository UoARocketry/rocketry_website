import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import {
  getNumberField,
  revalidatePaths,
  revalidateTags,
} from "../hooks/revalidation.ts";

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
    afterChange: [
      async ({ doc, previousDoc }) => {
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
      async ({ doc }) => {
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
    { name: "photo", type: "text", required: true },
    { name: "year", type: "number", required: true, index: true },
    { name: "order", type: "number", required: true, defaultValue: 1 },
    { name: "linkedinUrl", type: "text", required: false },
  ],
};
