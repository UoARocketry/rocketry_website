import type { CollectionConfig } from "payload";
import { isLoggedIn } from "../access/policies.ts";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    read: isLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: false,
    },
  ],
};
