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
import { validateOptionalUrl } from "../fields/validators.ts";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "eventTag", "_status"],
    group: "Events",
    description:
      "Everything listed on the Events page, newest first. Unpublished drafts appear at the top and are not visible on the site.",
    preview: createPreviewUrl("events"),
    components: {
      edit: {
        PreviewButton:
          "/payload/components/LabelledPreviewButton.tsx#LabelledPreviewButton",
      },
    },
  },
  defaultSort: ["_status", "-date"],
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
          "events",
          currentSlug ? `event:${currentSlug}` : null,
          previousSlug && previousSlug !== currentSlug
            ? `event:${previousSlug}`
            : null,
        ]);

        revalidatePaths([
          "/",
          "/events",
          currentSlug ? `/events/${currentSlug}` : null,
          previousSlug && previousSlug !== currentSlug
            ? `/events/${previousSlug}`
            : null,
        ]);
      },
    ],
    afterDelete: [
      ({ doc }) => {
        const deletedSlug = getStringField(doc, "slug");

        revalidateTags(["events", deletedSlug ? `event:${deletedSlug}` : null]);
        revalidatePaths([
          "/",
          "/events",
          deletedSlug ? `/events/${deletedSlug}` : null,
        ]);
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    createSlugField({ sourceField: "title", pathPrefix: "/events" }),
    ...createImagePairFields({
      uploadName: "imageMedia",
      urlName: "image",
      label: "Event image",
      required: true,
    }),
    { name: "description", type: "textarea", required: true },
    {
      name: "date",
      type: "date",
      required: true,
      admin: {
        date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" },
        description:
          "When the event starts. For an event running over more than one day, this is the first day.",
      },
    },
    {
      name: "endTime",
      type: "date",
      required: false,
      label: "End time",
      admin: {
        date: { pickerAppearance: "timeOnly", timeFormat: "HH:mm" },
        description:
          "Optional. When the event finishes that day. Leave empty and the page shows a start time only.",
      },
    },
    {
      name: "extraDates",
      type: "array",
      required: false,
      label: "Extra days",
      labels: { singular: "Extra day", plural: "Extra days" },
      admin: {
        initCollapsed: true,
        description:
          "Optional. For one event that runs across more than one day, e.g. an open day on both the Saturday and the Sunday. Add each further day here and the page reads 'September 3 & 4'. For a workshop series with different content each week, use Sessions below instead.",
      },
      fields: [
        {
          name: "date",
          type: "date",
          required: true,
          admin: {
            date: { pickerAppearance: "dayOnly" },
            description: "The further day this event also runs on.",
          },
        },
        {
          name: "startTime",
          type: "date",
          required: false,
          admin: {
            date: { pickerAppearance: "timeOnly", timeFormat: "HH:mm" },
            description:
              "Leave empty to run the same hours as the first day. Fill both in only if this day differs.",
          },
        },
        {
          name: "endTime",
          type: "date",
          required: false,
          admin: {
            date: { pickerAppearance: "timeOnly", timeFormat: "HH:mm" },
          },
        },
      ],
    },
    {
      name: "eventTag",
      type: "relationship",
      relationTo: "event-tags" as never,
      required: false,
      admin: {
        description: "Manage the available tags in the Event Tags collection.",
      },
    },
    {
      name: "signupUrl",
      type: "text",
      required: false,
      validate: (value: unknown) => validateOptionalUrl(value, "Signup URL"),
    },
    { name: "location", type: "text", required: false },
    {
      name: "sessions",
      type: "array",
      required: false,
      labels: { singular: "Session", plural: "Sessions" },
      admin: {
        initCollapsed: true,
        description:
          "Optional. For a multi-session series (e.g. Level 1 build workshops), add each session in the order they run. Leave empty for a normal one-off event.",
      },
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "date",
          type: "date",
          required: true,
          admin: {
            date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" },
          },
        },
        {
          name: "endTime",
          type: "date",
          required: false,
          label: "End time",
          admin: {
            date: { pickerAppearance: "timeOnly", timeFormat: "HH:mm" },
            description: "Optional. When this session finishes.",
          },
        },
        { name: "description", type: "textarea", required: false },
        {
          name: "location",
          type: "text",
          required: false,
          admin: {
            description:
              "Optional. Falls back to the event location above if left empty.",
          },
        },
      ],
    },
  ],
};
