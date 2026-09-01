import type { CollectionConfig } from "payload";
import { isLoggedIn, isPublicRead } from "../access/policies.ts";
import { revalidatePaths, revalidateTags } from "../hooks/revalidation.ts";
import { createOrderCollisionHook } from "../hooks/order-collision.ts";
import { createReferenceGuardHook } from "../hooks/reference-guard.ts";

export const SponsorTiers: CollectionConfig = {
  slug: "sponsor-tiers",
  labels: { singular: "Sponsor Tier", plural: "Sponsor Tiers" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "order"],
    group: "Sponsors",
    description:
      "The sections the Sponsors page is split into, in display order. A tier cannot be deleted while sponsors are still in it.",
  },
  defaultSort: "order",
  access: {
    read: isPublicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  hooks: {
    afterChange: [
      createOrderCollisionHook(),
      () => {
        revalidateTags(["sponsors"]);
        revalidatePaths(["/sponsors"]);
      },
    ],
    beforeDelete: [
      createReferenceGuardHook({
        subject: "sponsor tier",
        checks: [{ collection: "sponsors", field: "tier", label: "Sponsors" }],
      }),
    ],
    afterDelete: [
      () => {
        revalidateTags(["sponsors"]);
        revalidatePaths(["/sponsors"]);
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    { name: "description", type: "textarea", required: false },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 1,
      admin: {
        description:
          "Position on the Sponsors page, starting at 1. Claim a position that is taken and the others shift down automatically.",
      },
    },
  ],
};
