import type { CollectionConfig } from "payload";
import {
  ADMIN_ROLE,
  EDITOR_ROLE,
  USER_ROLE_OPTIONS,
  isAdmin,
  isAdminFieldLevel,
  isAdminOrSelf,
} from "../access/policies.ts";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes, in milliseconds
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role"],
    group: "Admin",
    description:
      "Who can sign in to this admin. Admins manage accounts; editors can change site content but not accounts.",
    // Access control already limited an editor to their own row, but the
    // collection still appeared in the nav, which reads as a hole. Hiding it
    // matches the expectation that accounts are admin-only.
    //
    // Read access stays `isAdminOrSelf` rather than `isAdmin` on purpose: the
    // /admin/account page loads the signed-in user's own document, so an
    // admin-only read would stop an editor changing their own password.
    hidden: ({ user }) =>
      (user as { role?: unknown } | null | undefined)?.role !== ADMIN_ROLE,
  },
  access: {
    // Editors can reach their own record so they can change their password,
    // but only admins can see or touch anyone else's.
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    create: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Shown in the account list so it is not just an email.",
      },
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: EDITOR_ROLE,
      options: USER_ROLE_OPTIONS,
      access: {
        // Without this an editor could open their own account and promote
        // themselves, which would defeat the split entirely.
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      admin: {
        description:
          "Editors can manage all site content. Admins can additionally create, edit and delete accounts. Keep at least two admins so nobody is locked out.",
      },
    },
  ],
};
