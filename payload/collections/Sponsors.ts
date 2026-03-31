import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";
import { SPONSOR_TIER_OPTIONS } from "../fields/options.ts";
import { validateRequiredUrl } from "../fields/validators.ts";

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
    {
      name: "logo",
      type: "text",
      required: true,
      validate: (value: unknown) => validateRequiredUrl(value, "Logo URL"),
    },
    {
      name: "url",
      type: "text",
      required: true,
      validate: (value: unknown) => validateRequiredUrl(value, "Sponsor URL"),
    },
    { name: "description", type: "textarea", required: false },
    {
      name: "tier",
      type: "select",
      required: false,
      options: SPONSOR_TIER_OPTIONS,
    },
  ],
};
