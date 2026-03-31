import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { revalidateAboutContent } from "../hooks/revalidation.ts";

export const Stats: CollectionConfig = {
  slug: "stats",
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "value", "order"],
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
    { name: "value", type: "text", required: true },
    { name: "label", type: "text", required: true, unique: true },
    { name: "order", type: "number", required: true, defaultValue: 1 },
  ],
};
