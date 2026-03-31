import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";

export const JourneyItems: CollectionConfig = {
  slug: "journey-items",
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
      async () => {
        revalidateTags(["about"]);
        revalidatePaths(["/about"]);
      },
    ],
    afterDelete: [
      async () => {
        revalidateTags(["about"]);
        revalidatePaths(["/about"]);
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
      options: [
        { label: "Background", value: "background" },
        { label: "Surface", value: "surface" },
      ],
    },
    { name: "order", type: "number", required: true, defaultValue: 1 },
  ],
};
