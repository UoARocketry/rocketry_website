import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import {
  getNumberField,
  revalidatePaths,
  revalidateTags,
} from "../hooks/revalidation.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { createOrderCollisionHook } from "../hooks/order-collision.ts";
import { createImagePairFields } from "../fields/image-pair.ts";
import { validateOptionalUrl } from "../fields/validators.ts";

export const Executives: CollectionConfig = {
  slug: "executives",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "year", "order", "_status"],
    group: "People",
    description:
      "The committee, grouped by year. Order sets the position within a year and is kept tidy automatically.",
  },
  // Drafts first so unpublished work is visible rather than buried, then
  // newest committee year, then position within that year.
  defaultSort: ["_status", "-year", "order"],
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
        relationField: "photoMedia",
        urlField: "photo",
      }),
    ],
    afterChange: [
      createOrderCollisionHook({ scopeField: "year" }),
      ({ doc, previousDoc }) => {
        const year = getNumberField(doc, "year");
        const previousYear = getNumberField(previousDoc, "year");

        revalidateTags([
          "about",
          "exec",
          "exec-years",
          year !== null ? `exec-year:${year}` : null,
          previousYear !== null && previousYear !== year
            ? `exec-year:${previousYear}`
            : null,
        ]);

        revalidatePaths(["/about"]);
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const year = getNumberField(doc, "year");

        revalidateTags([
          "about",
          "exec",
          "exec-years",
          year !== null ? `exec-year:${year}` : null,
        ]);

        revalidatePaths(["/about"]);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "bio", type: "textarea", required: true },
    ...createImagePairFields({
      uploadName: "photoMedia",
      urlName: "photo",
      label: "Photo",
      required: false,
      uploadDescription:
        "Leave empty and the card shows the exec's initials instead.",
    }),
    {
      name: "photoPosition",
      type: "text",
      required: false,
      defaultValue: "50% 50%",
      admin: {
        // Framing only makes sense once there is something to frame.
        condition: (_data, siblingData) =>
          Boolean((siblingData as Record<string, unknown> | undefined)?.photo),
        components: {
          Field: "/payload/components/PhotoPositionField.tsx#PhotoPositionField",
        },
      },
    },
    {
      name: "year",
      type: "number",
      required: true,
      index: true,
      defaultValue: () => new Date().getFullYear(),
      admin: {
        description:
          "The committee year this person served. The About page groups execs by this.",
      },
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 1,
      admin: {
        description:
          "Position within this year, starting at 1. Claim a position that is taken and everyone below shifts down automatically on publish.",
      },
    },
    {
      name: "linkedinUrl",
      type: "text",
      required: false,
      validate: (value: unknown) => validateOptionalUrl(value, "LinkedIn URL"),
    },
  ],
};
