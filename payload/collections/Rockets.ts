import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import {
  getStringField,
  revalidatePaths,
  revalidateTags,
} from "../hooks/revalidation.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { createImagePairFields } from "../fields/image-pair.ts";
import { createPreviewUrl, createSlugField } from "../fields/slug.ts";

export const Rockets: CollectionConfig = {
  slug: "rockets",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "featured", "launchedAt", "_status"],
    group: "Rockets",
    description:
      "Every rocket shown on the Rockets page. Leave the launch date empty while one is still in development.",
    preview: createPreviewUrl("rockets"),
    components: {
      edit: {
        PreviewButton:
          "/payload/components/LabelledPreviewButton.tsx#LabelledPreviewButton",
      },
    },
  },
  defaultSort: ["_status", "-launchedAt"],
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
        relationField: "imageMedia",
        urlField: "image",
      }),
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        const currentSlug = getStringField(doc, "slug");
        const previousSlug = getStringField(previousDoc, "slug");

        revalidateTags([
          "rockets",
          currentSlug ? `rocket:${currentSlug}` : null,
          previousSlug && previousSlug !== currentSlug
            ? `rocket:${previousSlug}`
            : null,
        ]);

        revalidatePaths([
          "/",
          "/rockets",
          currentSlug ? `/rockets/${currentSlug}` : null,
          previousSlug && previousSlug !== currentSlug
            ? `/rockets/${previousSlug}`
            : null,
        ]);
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const deletedSlug = getStringField(doc, "slug");

        revalidateTags([
          "rockets",
          deletedSlug ? `rocket:${deletedSlug}` : null,
        ]);

        revalidatePaths([
          "/",
          "/rockets",
          deletedSlug ? `/rockets/${deletedSlug}` : null,
        ]);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    createSlugField({ sourceField: "name", pathPrefix: "/rockets" }),
    ...createImagePairFields({
      uploadName: "imageMedia",
      urlName: "image",
      label: "Rocket image",
      required: true,
      uploadDescription: "This is the cover image at the top of the page.",
      framing: {
        name: "imagePosition",
        label: "Image position on cards",
        shape: "rect",
        aspect: 1.5,
        // The rocket's own page shows this image whole, so framing only ever
        // affects the cards. Their frame is a little wider on a phone than the
        // preview, which is why this positions a focus point rather than
        // cutting a fixed rectangle.
        appliesTo: "the rocket cards",
      },
    }),
    { name: "description", type: "textarea", required: false },
    {
      name: "featured",
      type: "checkbox",
      label: "Show on home page",
      defaultValue: false,
      index: true,
      admin: {
        description:
          "Tick to feature this rocket in the Featured Rockets section on the home page. Up to 3 are shown, next launch first. If none are ticked the home page falls back to the most recently launched rockets.",
      },
    },
    {
      name: "launchedAt",
      type: "date",
      required: false,
      admin: {
        date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" },
        description:
          "Leave empty while the rocket is still in development. A date in the future marks it as a scheduled launch; a date in the past marks it as launched.",
      },
    },
    {
      name: "specs",
      type: "array",
      label: "Details",
      required: false,
      labels: { singular: "Detail", plural: "Details" },
      admin: {
        initCollapsed: true,
        description:
          "Entries shown in the Details box on this rocket's page, in this order, laid out in two columns. Leave empty and the box is hidden entirely.",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          admin: {
            description:
              'The small heading, e.g. "Height", "Motor", "Recovery".',
          },
        },
        {
          name: "value",
          type: "text",
          required: true,
          admin: {
            description:
              'The figure itself, including units, e.g. "2.4 m", "Cesaroni J410".',
          },
        },
      ],
    },
    {
      name: "gallery",
      type: "upload",
      relationTo: "media" as never,
      hasMany: true,
      required: false,
      admin: {
        description:
          "Additional photos shown in the image gallery on the rocket's detail page, after the cover image above. Drag to reorder.",
      },
    },
  ],
};
