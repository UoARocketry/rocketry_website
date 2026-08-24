import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";
import {
  validateRequiredUrl,
  validateUrlOrUpload,
} from "../fields/validators.ts";

export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "tier", "url"],
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
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
        relationField: "logoMedia",
        urlField: "logo",
      }),
    ],
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
      name: "logoMedia",
      type: "upload",
      relationTo: "media" as never,
      required: false,
      admin: {
        description:
          "Upload or select a logo. This auto-fills the Logo URL field.",
      },
    },
    {
      name: "logo",
      type: "text",
      required: false,
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
        validateUrlOrUpload(value, siblingData, "logoMedia", "Logo URL"),
      admin: {
        description:
          "Auto-filled from the upload above whenever a file is selected there (overwrites this field on save). Leave the upload empty to link an external logo URL directly instead.",
      },
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
      type: "relationship",
      relationTo: "sponsor-tiers" as never,
      required: false,
      admin: {
        description: "Manage the available tiers in the Sponsor Tiers collection.",
      },
    },
  ],
};
