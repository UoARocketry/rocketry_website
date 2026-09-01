import type { Field, GeneratePreviewURL } from "payload";

/**
 * Builds the "Preview" button target for a slug-addressed collection.
 *
 * Points at `/preview`, which checks the Payload session before turning on
 * Next's draft mode, so the button cannot be used to expose drafts to anyone
 * who is not signed in to the admin.
 */
export function createPreviewUrl(collection: string): GeneratePreviewURL {
  return (doc) => {
    const slug = typeof doc?.slug === "string" ? doc.slug : "";
    if (!slug) {
      return null;
    }

    return `/preview?collection=${collection}&slug=${encodeURIComponent(slug)}`;
  };
}

/**
 * Converts a human title into the URL segment used by `/events/<slug>` and
 * `/rockets/<slug>`. Idempotent, so re-running it over a settled slug is a
 * no-op.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    // Drop the combining marks left behind by NFKD, so "é" folds to "e".
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

type SlugFieldOptions = {
  /** Field the slug is generated from on create, e.g. "title" or "name". */
  sourceField: string;
  /** Public path the slug appears under, used only in the help text. */
  pathPrefix: string;
};

/**
 * A URL slug that fills itself in from `sourceField` when a document is first
 * created and is then left alone.
 *
 * Deliberately not regenerated when the title later changes: once a page has
 * been published and shared, changing its slug silently breaks every existing
 * link to it. Editors can still overwrite it by hand when they mean to.
 */
export function createSlugField({
  sourceField,
  pathPrefix,
}: SlugFieldOptions): Field {
  return {
    name: "slug",
    type: "text",
    required: true,
    unique: true,
    index: true,
    admin: {
      position: "sidebar",
      description: `The URL for this page: ${pathPrefix}/your-slug. Filled in automatically from the ${sourceField} when you first save. Changing it later breaks any link already shared, so only edit it if you mean to.`,
    },
    hooks: {
      beforeValidate: [
        ({ value, siblingData, operation }) => {
          const current = typeof value === "string" ? value.trim() : "";
          if (current.length > 0) {
            // Normalise whatever was typed rather than rejecting it outright.
            return slugify(current);
          }

          // Only auto-fill on create. An existing document with a cleared slug
          // falls through to the required check instead of silently changing
          // its public URL.
          if (operation !== "create") {
            return value;
          }

          const source = (siblingData as Record<string, unknown> | undefined)?.[
            sourceField
          ];
          return typeof source === "string" ? slugify(source) : value;
        },
      ],
    },
    validate: (value: unknown) => {
      if (typeof value !== "string" || value.trim().length === 0) {
        return "Slug is required. It is normally filled in for you from the title.";
      }
      if (!isValidSlug(value)) {
        return "Slug must be lowercase letters, numbers and single hyphens, e.g. aurora-mk-ii.";
      }
      return true;
    },
  };
}
