import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
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
    ...createImagePairFields({
      uploadName: "logoMedia",
      urlName: "logo",
      label: "Logo",
      required: true,
    }),
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
