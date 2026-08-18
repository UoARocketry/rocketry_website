import type { Sponsor } from "@/lib/site-data";

export type SponsorTierSection = {
  id: number;
  name: string;
  description: string | null;
  sponsors: Sponsor[];
};

export function buildSponsorTierSections(
  sponsors: Sponsor[],
): SponsorTierSection[] {
  const sections = new Map<
    number,
    { name: string; description: string | null; order: number; sponsors: Sponsor[] }
  >();

  for (const sponsor of sponsors) {
    const tier = sponsor.tier;
    if (!tier) continue;

    let section = sections.get(tier.id);
    if (!section) {
      section = {
        name: tier.name,
        description: tier.description ?? null,
        order: tier.order,
        sponsors: [],
      };
      sections.set(tier.id, section);
    }

    section.sponsors.push(sponsor);
  }

  return Array.from(sections.entries())
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([id, section]) => ({
      id,
      name: section.name,
      description: section.description,
      sponsors: section.sponsors,
    }));
}
