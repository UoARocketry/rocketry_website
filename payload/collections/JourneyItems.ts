import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { BACKGROUND_SURFACE_OPTIONS } from "../fields/options.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { validateUrlOrUpload } from "../fields/validators.ts";
import { revalidateAboutContent } from "../hooks/revalidation.ts";

export const JourneyItems: CollectionConfig = {
  slug: "journey-items",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "variant"],
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
        relationField: "imageMedia",
        urlField: "image",
      }),
    ],
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
    {
      name: "imageMedia",
      type: "upload",
      relationTo: "media" as never,
      required: false,
      admin: {
        description:
          "Upload or select an image. This auto-fills the image URL field.",
      },
    },
    {
      name: "image",
      type: "text",
      // See Events.ts: `required` is the asterisk only; `validate` is the gate.
      required: true,
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
        validateUrlOrUpload(value, siblingData, "imageMedia", "Image"),
    },
    {
      name: "variant",
      type: "select",
      required: false,
      options: BACKGROUND_SURFACE_OPTIONS,
    },
    { name: "order", type: "number", required: true, defaultValue: 1 },
  ],
};
