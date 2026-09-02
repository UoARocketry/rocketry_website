import type { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache.js";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { refreshMediaUsageFor } from "../hooks/media-usage.ts";
import { createImagePairFields } from "../fields/image-pair.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";
import { urlFieldHooks, validateOptionalUrl } from "../fields/validators.ts";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: {
    group: "Admin",
    description:
      "Site-wide links, contact details and dashboard settings. Changes here affect every page.",
  },
  access: {
    read: isPublicRead,
    update: isLoggedIn,
  },
  hooks: {
    beforeChange: [
      createMediaRelationUrlSyncHook({
        relationField: "execTeamImageMedia",
        urlField: "execTeamImageUrl",
      }),
    ],
    afterChange: [
      // The one image held by a global rather than a collection.
      async ({ doc, previousDoc, req }) => {
        await refreshMediaUsageFor(req, [
          (doc as Record<string, unknown>)?.execTeamImageMedia,
          (previousDoc as Record<string, unknown>)?.execTeamImageMedia,
        ]);
      },
      () => {
        revalidateTags(["settings"]);
        revalidatePath("/", "layout");
        revalidatePaths(["/about", "/events", "/rockets", "/sponsors"]);
      },
    ],
  },
  versions: {
    // Globals use `max`; collections use `maxPerDoc`.
    drafts: true,
    max: 20,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Links",
          description: "Where the site sends people. All optional.",
          fields: [
            {
              name: "memberJoinUrl",
              type: "text",
              required: false,
              hooks: urlFieldHooks,
              validate: (value: unknown) =>
                validateOptionalUrl(value, "Member join URL"),
              admin: {
                description:
                  "The 'Join' button target, usually the club's AUSA or sign-up page.",
              },
            },
            {
              name: "discordUrl",
              type: "text",
              required: false,
              hooks: urlFieldHooks,
              validate: (value: unknown) =>
                validateOptionalUrl(value, "Discord URL"),
              admin: {
                description:
                  "Invite link shown in the footer. Use a Discord invite set to never expire.",
              },
            },
            {
              name: "instagramUrl",
              type: "text",
              required: false,
              hooks: urlFieldHooks,
              validate: (value: unknown) =>
                validateOptionalUrl(value, "Instagram URL"),
            },
            {
              name: "linkedinUrl",
              type: "text",
              required: false,
              hooks: urlFieldHooks,
              validate: (value: unknown) =>
                validateOptionalUrl(value, "LinkedIn URL"),
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              name: "contactEmail",
              type: "email",
              required: false,
              admin: {
                description:
                  "Used by every Contact / email link on the site (footer, sponsorship enquiries) and in search-engine structured data. Leave blank to fall back to the built-in default.",
              },
            },
          ],
        },
        {
          label: "Images",
          fields: createImagePairFields({
            uploadName: "execTeamImageMedia",
            urlName: "execTeamImageUrl",
            label: "Executive team image",
            required: false,
            uploadDescription: "The group photo on the About page.",
          }),
        },
        {
          label: "Limits",
          description:
            "These only scale the usage bars on the dashboard. The measured sizes are always accurate.",
          fields: [
            {
              name: "databaseLimitMb",
              type: "number",
              required: false,
              defaultValue: 500,
              min: 1,
              label: "Database limit (MB)",
              admin: {
                description:
                  "Update if the Supabase plan changes. Free tier is 500 MB.",
              },
            },
            {
              name: "storageLimitMb",
              type: "number",
              required: false,
              defaultValue: 1024,
              min: 1,
              label: "Media storage limit (MB)",
              admin: {
                description: "Free tier is 1024 MB (1 GB).",
              },
            },
          ],
        },
      ],
    },
  ],
};
