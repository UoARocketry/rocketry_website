import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";

export const SponsorTiers: CollectionConfig = {
  slug: "sponsor-tiers",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "order"],
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
        revalidateTags(["sponsors"]);
        revalidatePaths(["/sponsors"]);
      },
    ],
    afterDelete: [
      () => {
        revalidateTags(["sponsors"]);
        revalidatePaths(["/sponsors"]);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    { name: "description", type: "textarea", required: false },
    { name: "order", type: "number", required: true, defaultValue: 1 },
  ],
};
