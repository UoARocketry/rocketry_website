import type { Access, FieldAccess } from "payload";

export const ADMIN_ROLE = "admin";
export const EDITOR_ROLE = "editor";

export const USER_ROLE_OPTIONS = [
  {
    label: "Admin — full access, including managing user accounts",
    value: ADMIN_ROLE,
  },
  {
    label: "Editor — can edit all site content, cannot manage accounts",
    value: EDITOR_ROLE,
  },
];

function hasAdminRole(user: unknown): boolean {
  return (
    typeof user === "object" &&
    user !== null &&
    (user as { role?: unknown }).role === ADMIN_ROLE
  );
}

export const isPublicRead: Access = () => true;

export const isLoggedIn: Access = ({ req }) => Boolean(req.user);

/**
 * Gates account management. Without this any logged-in committee member could
 * delete the other accounts and lock the club out of its own CMS.
 */
export const isAdmin: Access = ({ req }) => hasAdminRole(req.user);

/**
 * Lets a user reach their own account while keeping everyone else's private,
 * so an editor can still change their own password.
 */
export const isAdminOrSelf: Access = ({ req }) => {
  if (hasAdminRole(req.user)) {
    return true;
  }
  if (!req.user) {
    return false;
  }
  return { id: { equals: req.user.id } };
};

/**
 * Field-level guard for `role` itself. Without it an editor could open their
 * own account and promote themselves, which would defeat the whole split.
 */
export const isAdminFieldLevel: FieldAccess = ({ req }) => hasAdminRole(req.user);
