import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { createOrderCollisionHook } from "../hooks/order-collision.ts";
import { revalidateAboutContent } from "../hooks/revalidation.ts";

export const Stats: CollectionConfig = {
  slug: "stats",
  labels: { singular: "Stat", plural: "Stats" },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "value", "order", "_status"],
    group: "About Page",
    description:
      "The headline numbers on the About page, e.g. '150' / 'Active members'.",
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
    {
      name: "value",
      type: "text",
      required: true,
      admin: { description: 'The figure itself, e.g. "150" or "12+".' },
    },
    {
      name: "label",
      type: "text",
      required: true,
      unique: true,
      admin: { description: 'What the figure counts, e.g. "Active members".' },
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 1,
      admin: {
        description:
          "Position in the row of stats, starting at 1. Claim a position that is taken and the others shift down automatically on publish.",
      },
    },
  ],
};
