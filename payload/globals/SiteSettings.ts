import type { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  access: {
    read: isPublicRead,
    update: isLoggedIn,
  },
  hooks: {
    afterChange: [
      async () => {
        revalidateTags(["settings"]);
        revalidatePath("/", "layout");
        revalidatePaths(["/", "/about", "/events", "/rockets", "/sponsors"]);
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
    },
    {
      name: "execTeamImageUrl",
      type: "text",
      required: false,
    },
  ],
};
