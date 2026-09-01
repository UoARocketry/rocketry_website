import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { BACKGROUND_SURFACE_OPTIONS } from "../fields/options.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { createImagePairFields } from "../fields/image-pair.ts";
import { createOrderCollisionHook } from "../hooks/order-collision.ts";
import { revalidateAboutContent } from "../hooks/revalidation.ts";

export const JourneyItems: CollectionConfig = {
  slug: "journey-items",
  labels: { singular: "Journey Item", plural: "Journey Items" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "variant", "_status"],
    group: "About Page",
    description:
      "The club's story timeline on the About page, in the order it reads.",
  },
  defaultSort: ["_status", "order"],
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
        relationField: "imageMedia",
        urlField: "image",
      }),
    ],
    afterChange: [
      createOrderCollisionHook(),
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
    ...createImagePairFields({
      uploadName: "imageMedia",
      urlName: "image",
      label: "Image",
      required: true,
    }),
    {
      name: "variant",
      type: "select",
      required: false,
      options: BACKGROUND_SURFACE_OPTIONS,
      admin: {
        description:
          "Background shade for this block. Alternate between blocks so the page has visible banding.",
      },
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 1,
      admin: {
        description:
          "Position in the timeline, starting at 1. Claim a position that is taken and the others shift down automatically on publish.",
      },
    },
  ],
};
