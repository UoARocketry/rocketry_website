import type { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache.js";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { createMediaRelationUrlSyncHook } from "../hooks/media-url-sync.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";
import { validateOptionalUrl } from "../fields/validators.ts";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
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
      () => {
        revalidateTags(["settings"]);
        revalidatePath("/", "layout");
        revalidatePaths(["/about", "/events", "/rockets", "/sponsors"]);
      },
    ],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "memberJoinUrl",
      type: "text",
      required: false,
      validate: (value: unknown) =>
        validateOptionalUrl(value, "Member join URL"),
    },
    {
      name: "execTeamImageMedia",
      type: "upload",
      relationTo: "media" as never,
      required: false,
      admin: {
        description:
          "Upload or select an executive team image. This auto-fills the URL field.",
      },
    },
    {
      name: "execTeamImageUrl",
      type: "text",
      required: false,
      validate: (value: unknown) =>
        validateOptionalUrl(value, "Executive team image URL"),
    },
    {
      name: "discordUrl",
      type: "text",
      required: false,
      validate: (value: unknown) => validateOptionalUrl(value, "Discord URL"),
      admin: {
        description: "Invite link shown in the footer. Use a Discord invite set to never expire.",
      },
    },
    {
      name: "instagramUrl",
      type: "text",
      required: false,
      validate: (value: unknown) =>
        validateOptionalUrl(value, "Instagram URL"),
    },
    {
      name: "linkedinUrl",
      type: "text",
      required: false,
      validate: (value: unknown) =>
        validateOptionalUrl(value, "LinkedIn URL"),
    },
    {
      name: "databaseLimitMb",
      type: "number",
      required: false,
      defaultValue: 500,
      min: 1,
      label: "Database limit (MB)",
      admin: {
        description:
          "Only scales the usage bar on this dashboard — the measured size is always accurate. Update if the Supabase plan changes. Free tier is 500 MB.",
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
        description:
          "Only scales the usage bar on this dashboard. Free tier is 1024 MB (1 GB).",
      },
    },
  ],
};
