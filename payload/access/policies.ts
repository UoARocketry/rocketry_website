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

/**
 * Unrestricted read. Correct only for collections with no draft workflow,
 * where every row is publishable content (tags, tiers, media).
 * For anything with `versions.drafts`, use `isPublicReadPublished`.
 */
export const isPublicRead: Access = () => true;

/**
 * Read policy for collections that have drafts enabled.
 *
 * `isPublicRead` is not sufficient for those. Payload generates a public
 * REST and GraphQL API from every collection, and a document that has only
 * ever been a draft lives in the main table with `_status: 'draft'` and no
 * published version behind it. So an anonymous `GET /api/rockets` returned
 * unpublished documents in full, even though the website never showed them:
 * `lib/site-data.ts` filters `_status` itself, but nothing was filtering the
 * generated API.
 *
 * Returning a constraint rather than `true` pushes the filter into every read
 * path at once, which is the only way to cover endpoints we do not hand-write.
 *
 * Signed-in users still see drafts, which is what the admin UI and the preview
 * flow depend on. `lib/site-data.ts` is unaffected either way: the Local API
 * runs with `overrideAccess`, and it applies its own explicit filter anyway.
 */
export const isPublicReadPublished: Access = ({ req }) => {
  if (req.user) {
    return true;
  }

  return { _status: { equals: "published" } };
};

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
