import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicReadPublished } from "../access/policies.ts";
import { BACKGROUND_SURFACE_OPTIONS } from "../fields/options.ts";
import { createOrderCollisionHook } from "../hooks/order-collision.ts";
import { revalidateAboutContent } from "../hooks/revalidation.ts";

export const TeamRoles: CollectionConfig = {
  slug: "team-roles",
  labels: { singular: "Team Role", plural: "Team Roles" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "variant", "_status"],
    group: "About Page",
    description:
      "The sub-teams described on the About page, e.g. Structures or Avionics.",
  },
  defaultSort: ["_status", "order"],
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  trash: true,
  access: {
    read: isPublicReadPublished,
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
    { name: "title", type: "text", required: true, unique: true },
    { name: "body", type: "textarea", required: false },
    {
      name: "bullets",
      type: "array",
      required: false,
      labels: { singular: "Bullet", plural: "Bullets" },
      admin: {
        description: "Short points listed under the description.",
      },
      fields: [{ name: "value", type: "text", required: true }],
    },
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
