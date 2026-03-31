import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";

export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "tier", "url"],
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
        revalidateTags(["sponsors"]);
        revalidatePaths(["/sponsors"]);
      },
    ],
    afterDelete: [
      async () => {
        revalidateTags(["sponsors"]);
        revalidatePaths(["/sponsors"]);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    { name: "logo", type: "text", required: true },
    { name: "url", type: "text", required: true },
    { name: "description", type: "textarea", required: false },
    {
      name: "tier",
      type: "select",
      required: false,
      options: [
        { label: "Gold", value: "GOLD" },
        { label: "Silver", value: "SILVER" },
        { label: "Bronze", value: "BRONZE" },
      ],
    },
  ],
};
