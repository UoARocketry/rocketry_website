import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { BACKGROUND_SURFACE_OPTIONS } from "../fields/options.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { createImagePairFields } from "../fields/image-pair.ts";
import { createOrderCollisionHook } from "../hooks/order-collision.ts";
import { revalidateAboutContent } from "../hooks/revalidation.ts";

export const WhatWeDo: CollectionConfig = {
  slug: "what-we-do",
  // Without this Payload auto-pluralises the slug into "What We Dos".
  labels: { singular: "What We Do Item", plural: "What We Do" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "variant", "_status"],
    group: "About Page",
    description:
      "The 'What We Do' blocks on the About page, in display order.",
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
      framing: {
        name: "imagePosition",
        label: "Image position",
        shape: "rect",
        // Roughly a 410px grid column against the card's 224px image frame.
        aspect: 1.8,
        appliesTo: "the About page block",
      },
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
          "Position on the About page, starting at 1. Claim a position that is taken and the others shift down automatically on publish.",
      },
    },
  ],
};
