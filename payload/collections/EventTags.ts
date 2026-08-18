import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";

export const EventTags: CollectionConfig = {
  slug: "event-tags",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "order"],
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
    { name: "order", type: "number", required: true, defaultValue: 1 },
  ],
};
