import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import {
  getStringField,
  revalidatePaths,
  revalidateTags,
} from "../hooks/revalidation.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { rejectDuplicateDays } from "../hooks/duplicate-days.ts";
import {
  createMediaUsageDeleteHook,
  createMediaUsageHook,
} from "../hooks/media-usage.ts";
import { createImagePairFields } from "../fields/image-pair.ts";
import { createPreviewUrl, createSlugField } from "../fields/slug.ts";
import {
  createEndTimeValidate,
  urlFieldHooks,
  validateOptionalUrl,
  validateStartTimePresent,
} from "../fields/validators.ts";

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
    beforeValidate: [rejectDuplicateDays],
    beforeChange: [
      createMediaRelationUrlSyncHook({
        relationField: "imageMedia",
        urlField: "image",
      }),
    ],
    afterChange: [
      createMediaUsageHook(["imageMedia"]),
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
      createMediaUsageDeleteHook(["imageMedia"]),
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
      required: false,
      uploadDescription:
        "Usually the Instagram poster. Leave empty and the card shows a plain UARC panel instead.",
    }),
    { name: "description", type: "textarea", required: true },
    {
      name: "date",
      type: "date",
      required: false,
      admin: {
        date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" },
        description:
          "When the event starts. For an event running over more than one day, this is the first day. Optional: leave it empty for a series where only the sessions below have dates.",
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
      validate: createEndTimeValidate("date"),
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
            components: {
              Field:
                "/payload/components/DayOnlyDateField.tsx#DayOnlyDateField",
            },
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
          validate: validateStartTimePresent,
        },
        {
          name: "endTime",
          type: "date",
          required: false,
          admin: {
            date: { pickerAppearance: "timeOnly", timeFormat: "HH:mm" },
          },
          validate: createEndTimeValidate("startTime"),
        },
        {
          name: "location",
          type: "text",
          required: false,
          admin: {
            description:
              "Optional. Only if this day is somewhere else. Leave empty to use the event's location.",
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
      name: "signupType",
      type: "select",
      label: "Signup",
      required: false,
      defaultValue: "none",
      options: [
        { label: "No signup", value: "none" },
        { label: "Link to a signup page", value: "link" },
        { label: "Instructions in plain text", value: "text" },
      ],
      admin: {
        description:
          "How people sign up. Choose 'plain text' when there is no link to give, e.g. when the form only lives in the Instagram bio.",
      },
    },
    {
      name: "signupUrl",
      type: "text",
      label: "Signup URL",
      required: false,
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as Record<string, unknown> | undefined)?.signupType ===
          "link",
        description:
          "Shown as a Sign Up button on the event page, for upcoming events only.",
      },
      hooks: urlFieldHooks,
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
        const type = (siblingData as Record<string, unknown> | undefined)
          ?.signupType;
        // Only demanded when this is the chosen option: a URL left behind from
        // a previous choice must not block saving.
        if (type === "link" && !(typeof value === "string" && value.trim())) {
          return "Add the signup link, or change Signup to another option.";
        }
        return validateOptionalUrl(value, "Signup URL");
      },
    },
    {
      name: "signupLabel",
      type: "text",
      label: "Signup button label",
      required: false,
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as Record<string, unknown> | undefined)?.signupType ===
          "link",
        placeholder: "Sign Up",
        description:
          'What the button says. Leave empty for "Sign Up". Use something else when the link is not a signup, e.g. "Buy tickets" or "RSVP".',
      },
    },
    {
      name: "signupNote",
      type: "text",
      label: "Signup text",
      required: false,
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as Record<string, unknown> | undefined)?.signupType ===
          "text",
        description:
          'Shown in place of the button, e.g. "Sign up link in our Instagram bio".',
      },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
        const type = (siblingData as Record<string, unknown> | undefined)
          ?.signupType;
        if (type === "text" && !(typeof value === "string" && value.trim())) {
          return "Add the signup text, or change Signup to another option.";
        }
        return true;
      },
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
          "Optional. For a multi-session series (e.g. Level 1 build workshops), add each session. The site puts them in date order for you, so it does not matter what order you add them in. Leave empty for a normal one-off event.",
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
          validate: createEndTimeValidate("date"),
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
              "Optional. For a session that runs across more than one day, e.g. a build workshop held on both the Saturday and the Sunday. It still counts as one session.",
          },
          fields: [
            {
              name: "date",
              type: "date",
              required: true,
              admin: {
                components: {
                  Field:
                    "/payload/components/DayOnlyDateField.tsx#DayOnlyDateField",
                },
                description: "The further day this session also runs on.",
              },
            },
            {
              name: "startTime",
              type: "date",
              required: false,
              admin: {
                date: { pickerAppearance: "timeOnly", timeFormat: "HH:mm" },
                description:
                  "Leave empty to run the same hours as the session's first day.",
              },
              validate: validateStartTimePresent,
            },
            {
              name: "endTime",
              type: "date",
              required: false,
              admin: {
                date: { pickerAppearance: "timeOnly", timeFormat: "HH:mm" },
              },
              validate: createEndTimeValidate("startTime"),
            },
            {
              name: "location",
              type: "text",
              required: false,
              admin: {
                description:
                  "Optional. Only if this day is somewhere else. Leave empty to use the session's location.",
              },
            },
          ],
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
