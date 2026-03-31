import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { BACKGROUND_SURFACE_OPTIONS } from "../fields/options.ts";
import { revalidateAboutContent } from "../hooks/revalidation.ts";

export const WhatWeDo: CollectionConfig = {
  slug: "what-we-do",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "variant"],
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
      () => {
        revalidateAboutContent();
      },
    ],
    afterDelete: [
      () => {
        revalidateAboutContent();
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true, unique: true },
    { name: "body", type: "textarea", required: false },
    { name: "image", type: "text", required: false },
    {
      name: "variant",
      type: "select",
      required: false,
      options: BACKGROUND_SURFACE_OPTIONS,
    },
    { name: "order", type: "number", required: true, defaultValue: 1 },
  ],
};
