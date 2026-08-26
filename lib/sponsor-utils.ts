import type { Sponsor, SponsorTier } from "@/lib/site-data";

export type SponsorTierSection = {
  id: number;
  name: string;
  description: string | null;
  sponsors: Sponsor[];
};

/**
 * Builds the sponsors page's sections from the Sponsor Tiers collection, so a
 * tier's name, description and position come from the tier itself rather than
 * from whichever sponsor happened to be read first.
 *
 * Tiers with no sponsors are dropped: a heading over an empty grid reads as a
 * broken page rather than as an opening.
 *
 * A sponsor whose tier is missing or unknown is grouped into `orphans` instead
 * of being discarded, so nothing published in the CMS can silently vanish from
 * the site. `tier` is now required, so this should only ever catch rows saved
 * before that was true.
 */
export function buildSponsorTierSections(
  tiers: readonly SponsorTier[],
  sponsors: readonly Sponsor[],
): { sections: SponsorTierSection[]; orphans: Sponsor[] } {
  const byTierId = new Map<number, Sponsor[]>();
  const orphans: Sponsor[] = [];

  for (const sponsor of sponsors) {
    const tierId = sponsor.tier?.id;

    if (typeof tierId !== "number") {
      orphans.push(sponsor);
      continue;
    }

    const bucket = byTierId.get(tierId);
    if (bucket) {
      bucket.push(sponsor);
    } else {
      byTierId.set(tierId, [sponsor]);
    }
  }

  const sections = [...tiers]
    .sort((a, b) => a.order - b.order)
    .map((tier) => ({
      id: tier.id,
      name: tier.name,
      description: tier.description ?? null,
      sponsors: byTierId.get(tier.id) ?? [],
    }))
    .filter((section) => section.sponsors.length > 0);

  // A sponsor pointing at a tier that has since been deleted would otherwise
  // be dropped by the filter above, so sweep those into the orphan list too.
  const renderedIds = new Set(sections.map((section) => section.id));
  for (const [tierId, bucket] of byTierId) {
    if (!renderedIds.has(tierId) && !tiers.some((t) => t.id === tierId)) {
      orphans.push(...bucket);
    }
  }

  return { sections, orphans };
}
