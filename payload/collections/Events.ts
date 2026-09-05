import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicReadPublished } from "../access/policies.ts";
import { fieldHelp } from "../fields/help.ts";
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
import { createLinkListFields } from "../fields/link-list.ts";
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
    // Payload shows this on the create and edit screens as well as the list,
    // so it has to read correctly when you are looking at a single event.
    // "Everything listed, newest first" made sense only on the list.
    description:
      "Talks, workshops and launches shown on the Events page. A draft stays off the site until you publish it.",
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
    read: isPublicReadPublished,
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
      createMediaUsageHook(["imageMedia", "gallery"]),
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
      createMediaUsageDeleteHook(["imageMedia", "gallery"]),
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
    {
      name: "gallery",
      type: "upload",
      relationTo: "media" as never,
      hasMany: true,
      required: false,
      admin: {
        description:
          "Additional photos shown in the image gallery on the event's detail page, after the cover image above. Drag to reorder.",
      },
    },
    { name: "description", type: "textarea", required: true },
    {
      name: "date",
      type: "date",
      required: false,
      admin: {
        date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" },
        ...fieldHelp(
          "When the event starts. For a multi-day event, this is the first day.",
          "It's optional. Leave it empty for a series where only the sessions below have dates.",
        ),
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
      label: "Extra days and times",
      labels: { singular: "Extra day or time", plural: "Extra days and times" },
      admin: {
        initCollapsed: true,
        ...fieldHelp(
          "Optional. Extra days for an event that runs across more than one, like a build weekend.",
          "The page then reads 'September 3 & 4'. Running the same day twice? Add that date again with its own start and end time, and the page lists both sittings under it. If it's a workshop series with different content each week, use Sessions below instead.",
        ),
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
            description:
              "Another day this event runs on, or the same day again for a second sitting with different hours.",
          },
        },
        {
          name: "startTime",
          type: "date",
          required: false,
          admin: {
            date: { pickerAppearance: "timeOnly", timeFormat: "HH:mm" },
            description:
              "Leave empty to run the same hours as the first day. Fill both in if this day differs, or to add a second sitting on a date already listed.",
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
    ...createLinkListFields({
      name: "links",
      headingName: "linksHeading",
      defaultHeading: "Resources",
      singular: "Link",
      plural: "Links",
      description:
        "Optional. Anything worth linking alongside the event, like slides or a reading list.",
      descriptionMore:
        "An OpenRocket starter file works too. They show in their own section on the event page.",
      headingDescription:
        'What this section is called. Leave empty for "Resources".',
      labelPlaceholder: "Workshop slides",
    }),
    { name: "location", type: "text", required: false },
    {
      name: "sessions",
      type: "array",
      required: false,
      labels: { singular: "Session", plural: "Sessions" },
      admin: {
        initCollapsed: true,
        ...fieldHelp(
          "Optional. For a series like Level 1 build workshops, add each session here.",
          "The site puts them in date order for you, so it doesn't matter what order you add them in. Leave it empty for a normal one-off event.",
        ),
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
          label: "Extra days and times",
          labels: { singular: "Extra day or time", plural: "Extra days and times" },
          admin: {
            initCollapsed: true,
            ...fieldHelp(
              "Optional. Extra days for a session that runs across more than one.",
              "Like a build workshop held on the Saturday and the Sunday. Running it twice in one day? Add that date again with its own start and end time. Either way it still counts as one session.",
            ),
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
                description:
                  "Another day this session runs on, or the same day again for a second sitting with different hours.",
              },
            },
            {
              name: "startTime",
              type: "date",
              required: false,
              admin: {
                date: { pickerAppearance: "timeOnly", timeFormat: "HH:mm" },
                ...fieldHelp(
                  "Leave empty to run the same hours as the session's first day.",
                  "Fill both in if this day is different, or to add a second sitting on a date that's already listed.",
                ),
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
