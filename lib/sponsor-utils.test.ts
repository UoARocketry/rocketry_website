import { describe, expect, it } from "vitest";
import { buildSponsorTierSections } from "./sponsor-utils.ts";
import type { Sponsor, SponsorTier } from "./site-data.types.ts";

const tier = (id: number, name: string, order: number): SponsorTier => ({
  id,
  name,
  description: `${name} description`,
  order,
});

const sponsor = (id: number, name: string, t: SponsorTier | null): Sponsor => ({
  id,
  name,
  logo: "https://example.com/logo.png",
  url: "https://example.com",
  description: null,
  tier: t,
});

const GOLD = tier(1, "Gold", 1);
const SILVER = tier(2, "Silver", 2);
const BRONZE = tier(3, "Bronze", 3);

describe("buildSponsorTierSections", () => {
  it("orders sections by the tier's order, not by tier id or sponsor name", () => {
    const { sections } = buildSponsorTierSections(
      [tier(9, "Bronze", 3), tier(4, "Gold", 1), tier(7, "Silver", 2)],
      [
        sponsor(1, "C", tier(9, "Bronze", 3)),
        sponsor(2, "A", tier(4, "Gold", 1)),
        sponsor(3, "B", tier(7, "Silver", 2)),
      ],
    );

    expect(sections.map((s) => s.name)).toEqual(["Gold", "Silver", "Bronze"]);
  });

  it("takes the name and description from the tier, not from the sponsor", () => {
    const { sections } = buildSponsorTierSections(
      [GOLD],
      [sponsor(1, "Acme", GOLD)],
    );

    expect(sections[0].name).toBe("Gold");
    expect(sections[0].description).toBe("Gold description");
  });

  it("drops tiers that have no sponsors", () => {
    const { sections } = buildSponsorTierSections(
      [GOLD, SILVER, BRONZE],
      [sponsor(1, "Acme", GOLD), sponsor(2, "Globex", BRONZE)],
    );

    expect(sections.map((s) => s.name)).toEqual(["Gold", "Bronze"]);
  });

  it("groups every sponsor sharing a tier into one section", () => {
    const { sections } = buildSponsorTierSections(
      [GOLD],
      [sponsor(1, "Acme", GOLD), sponsor(2, "Globex", GOLD)],
    );

    expect(sections).toHaveLength(1);
    expect(sections[0].sponsors.map((s) => s.name)).toEqual(["Acme", "Globex"]);
  });

  it("preserves the incoming sponsor order within a section", () => {
    const { sections } = buildSponsorTierSections(
      [GOLD],
      [sponsor(1, "Zeta", GOLD), sponsor(2, "Alpha", GOLD)],
    );

    expect(sections[0].sponsors.map((s) => s.name)).toEqual(["Zeta", "Alpha"]);
  });

  it("reports a sponsor with no tier as an orphan rather than discarding it", () => {
    const { sections, orphans } = buildSponsorTierSections(
      [GOLD],
      [sponsor(1, "Acme", GOLD), sponsor(2, "Untiered", null)],
    );

    expect(sections[0].sponsors.map((s) => s.name)).toEqual(["Acme"]);
    expect(orphans.map((s) => s.name)).toEqual(["Untiered"]);
  });

  it("reports a sponsor pointing at a deleted tier as an orphan", () => {
    // The tier row is gone but the sponsor still references it, so it belongs
    // to no rendered section and would otherwise vanish without a trace.
    const { sections, orphans } = buildSponsorTierSections(
      [GOLD],
      [sponsor(1, "Acme", GOLD), sponsor(2, "Stale", tier(99, "Deleted", 1))],
    );

    expect(sections).toHaveLength(1);
    expect(orphans.map((s) => s.name)).toEqual(["Stale"]);
  });

  it("returns nothing to render when there are no sponsors at all", () => {
    const { sections, orphans } = buildSponsorTierSections([GOLD, SILVER], []);

    expect(sections).toEqual([]);
    expect(orphans).toEqual([]);
  });

  it("does not mutate the tiers array it is given", () => {
    const tiers = [SILVER, GOLD];
    buildSponsorTierSections(tiers, [sponsor(1, "Acme", GOLD)]);

    expect(tiers.map((t) => t.name)).toEqual(["Silver", "Gold"]);
  });
});
