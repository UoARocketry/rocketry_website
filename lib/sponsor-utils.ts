import type { Sponsor } from "@/lib/site-data";

export type SponsorTier = "gold" | "silver" | "bronze";

export type SponsorTierSection = {
  key: SponsorTier;
  title: string;
  description: string;
  sponsors: Sponsor[];
};

const TIER_META: Record<SponsorTier, { title: string; description: string }> = {
  gold: {
    title: "Gold Sponsors",
    description: "Our premier partners making major contributions",
  },
  silver: {
    title: "Silver Sponsors",
    description: "Valued supporters of our rocketry endeavors",
  },
  bronze: {
    title: "Bronze Sponsors",
    description: "Appreciated contributors to our mission",
  },
};

export function normalizeSponsorTier(
  tier: string | null | undefined,
): SponsorTier {
  const normalized = (tier ?? "").trim().toLowerCase();

  if (normalized === "gold" || normalized === "g") return "gold";
  if (normalized === "silver" || normalized === "s") return "silver";
  if (normalized === "bronze" || normalized === "b") return "bronze";

  return "bronze";
}

export function buildSponsorTierSections(
  sponsors: Sponsor[],
): SponsorTierSection[] {
  const grouped: Record<SponsorTier, Sponsor[]> = {
    gold: [],
    silver: [],
    bronze: [],
  };

  for (const sponsor of sponsors) {
    const tier = normalizeSponsorTier(sponsor.tier);
    grouped[tier].push(sponsor);
  }

  return (Object.keys(TIER_META) as SponsorTier[])
    .map((tier) => ({
      key: tier,
      title: TIER_META[tier].title,
      description: TIER_META[tier].description,
      sponsors: grouped[tier],
    }))
    .filter((section) => section.sponsors.length > 0);
}
