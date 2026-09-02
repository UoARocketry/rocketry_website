import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import {
  createMediaUsageDeleteHook,
  createMediaUsageHook,
} from "../hooks/media-usage.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";
import { createImagePairFields } from "../fields/image-pair.ts";
import { urlFieldHooks, validateRequiredUrl } from "../fields/validators.ts";

export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "tier", "url", "_status"],
    group: "Sponsors",
    description:
      "Organisations shown on the Sponsors page, grouped into the tier you pick.",
  },
  defaultSort: ["_status", "name"],
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  trash: true,
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
      createMediaUsageHook(["logoMedia"]),
      () => {
        revalidateTags(["sponsors"]);
        revalidatePaths(["/sponsors"]);
      },
    ],
    afterDelete: [
      createMediaUsageDeleteHook(["logoMedia"]),
      () => {
        revalidateTags(["sponsors"]);
        revalidatePaths(["/sponsors"]);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    ...createImagePairFields({
      uploadName: "logoMedia",
      urlName: "logo",
      label: "Logo",
      required: true,
    }),
    {
      name: "logoPlate",
      type: "select",
      label: "Logo backing",
      required: false,
      defaultValue: "light",
      options: [
        { label: "Light (default)", value: "light" },
        { label: "Dark — for a white or pale logo", value: "dark" },
      ],
      admin: {
        description:
          "Logos sit on a white plate, which suits dark and full-colour artwork. Switch to dark if this sponsor's logo is white or very pale, or it will be invisible.",
      },
    },
    {
      name: "url",
      type: "text",
      required: true,
      hooks: urlFieldHooks,
      validate: (value: unknown) => validateRequiredUrl(value, "Sponsor URL"),
      admin: { description: "The sponsor's own website, linked from their logo." },
    },
    { name: "description", type: "textarea", required: false },
    {
      name: "tier",
      type: "relationship",
      relationTo: "sponsor-tiers" as never,
      // Required because the sponsors page groups purely by tier: a sponsor
      // without one has no section to appear in and renders nowhere.
      required: true,
      admin: {
        description:
          "Which section of the sponsors page this sponsor appears in. Manage the available tiers in the Sponsor Tiers collection.",
      },
    },
  ],
};
