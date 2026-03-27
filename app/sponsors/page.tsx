import React from "react";
import SponsorCard from "@/components/ui/sponsor-card";
import { getSponsors, type Sponsor } from "@/lib/site-data";

export default async function SponsorsPage() {
  let sponsors: Sponsor[] = [];
  try {
    sponsors = await getSponsors();
  } catch (e) {
    console.warn("Could not load sponsors:", (e as Error).message);
  }

  // group by sponsor.tier
  const grouped: Record<string, Sponsor[]> = {
    gold: [],
    silver: [],
    bronze: [],
  };

  if (sponsors && sponsors.length > 0) {
    sponsors.forEach((s) => {
      const raw = (s.tier ?? "BRONZE").toString();
      const tierKey = raw.trim().toLowerCase();
      if (tierKey === "gold" || tierKey === "silver" || tierKey === "bronze") {
        grouped[tierKey].push(s);
      } else if (tierKey === "g" || tierKey === "s" || tierKey === "b") {
        const map: Record<string, string> = {
          g: "gold",
          s: "silver",
          b: "bronze",
        };
        grouped[map[tierKey]].push(s);
      } else {
        grouped.bronze.push(s);
      }
    });
  }

  const tierSections = [
    {
      key: "gold",
      title: "Gold Sponsors",
      description: "Our premier partners making major contributions",
      sponsors: grouped.gold,
    },
    {
      key: "silver",
      title: "Silver Sponsors",
      description: "Valued supporters of our rocketry endeavors",
      sponsors: grouped.silver,
    },
    {
      key: "bronze",
      title: "Bronze Sponsors",
      description: "Appreciated contributors to our mission",
      sponsors: grouped.bronze,
    },
  ].filter((section) => section.sponsors.length > 0);

  return (
    <main className="min-h-screen bg-background text-text-main">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 bg-background overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
            Thank You
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Sponsors</h1>
          <p className="text-lg text-text-secondary max-w-2xl mb-8">
            We are grateful for the generous support of our sponsors. Their
            contributions make our rocketry projects and events possible.
          </p>
          <a
            href="mailto:uoarocketryclub@gmail.com"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
            style={{ color: "#ffffff" }}
          >
            Become a Sponsor
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* Sponsor Tiers */}
      {tierSections.map((tier, idx) => (
        <section
          key={tier.key}
          className={`py-24 px-4 relative ${idx % 2 === 0 ? "bg-surface" : "bg-background"}`}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <p className="text-primary text-sm font-medium uppercase tracking-wider mb-2">
                {tier.key} Tier
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {tier.title}
              </h2>
              <p className="text-text-secondary">{tier.description}</p>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {tier.sponsors.map((sponsor: Sponsor) => (
                <SponsorCard sponsor={sponsor} key={sponsor.id} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section
        className={`py-24 px-4 relative ${tierSections.length % 2 === 0 ? "bg-surface" : "bg-background"}`}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-card rounded-2xl p-10 text-center border border-border overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-3">
                Become a Sponsor
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Support the next generation of rocketeers and get your company
                featured here. We offer various sponsorship tiers with different
                benefits.
              </p>
              <a
                href="mailto:uoarocketryclub@gmail.com"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                style={{ color: "#ffffff" }}
              >
                Contact Us
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
