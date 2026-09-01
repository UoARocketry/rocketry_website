import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";
import { createOrderCollisionHook } from "../hooks/order-collision.ts";

export const EventTags: CollectionConfig = {
  slug: "event-tags",
  labels: { singular: "Event Tag", plural: "Event Tags" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "order"],
    group: "Events",
    description:
      "The labels events can be filed under. Deleting one simply clears it from any event that used it.",
  },
  defaultSort: "order",
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
        revalidateTags(["events"]);
        revalidatePaths(["/", "/events"]);
      },
    ],
    afterDelete: [
      () => {
        revalidateTags(["events"]);
        revalidatePaths(["/", "/events"]);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 1,
      admin: {
        description:
          "Position in the filter row, starting at 1. Claim a position that is taken and the others shift down automatically.",
      },
    },
  ],
};
