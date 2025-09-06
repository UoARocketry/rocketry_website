import React from "react";
import SponsorCard from "@/components/ui/sponsor-card";

export default async function SponsorsPage() {
  let sponsors: any[] = [];
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? 3000}`);
    const res = await fetch(new URL("/api/sponsors", base).toString(), { cache: "no-store" });
    if (res.ok) sponsors = await res.json();
    else console.warn("Failed to load sponsors from API:", await res.text());
  } catch (e) {
    console.warn("⚠️  Could not load sponsors from API:", (e as Error).message);
  }

  // group by sponsor.tier
  const grouped: Record<string, any[]> = { gold: [], silver: [], bronze: [] };

  if (sponsors && sponsors.length > 0) {
    sponsors.forEach((s) => {
      const raw = (s.tier ?? "BRONZE").toString();
      const tierKey = raw.trim().toLowerCase();
      if (tierKey === "gold" || tierKey === "silver" || tierKey === "bronze") {
        grouped[tierKey].push(s);
      } else if (tierKey === "g" || tierKey === "s" || tierKey === "b") {
        // tolerate single-letter values if present
        const map: Record<string, string> = { g: "gold", s: "silver", b: "bronze" };
        grouped[map[tierKey]].push(s);
      } else {
        grouped.bronze.push(s);
      }
    });
  }

  return (
    <main className="min-h-screen bg-background pb-16 text-text-main flex justify-center">
      <div className="w-full max-w-7xl">
        <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
          <h1 className="text-5xl font-extrabold mb-4 text-primary">Our Sponsors</h1>
          <p className="text-lg text-text-secondary max-w-2xl mb-4">
            We are grateful for the generous support of our sponsors. Their contributions make our rocketry projects and events possible. Interested in sponsoring us?
          </p>
          <a href="mailto:uoarocketryclub@gmail.com" className="button inline-block">Contact Us</a>
        </section>

        {/* Gold Sponsors */}
        {grouped.gold.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mt-12">
            <h2 className="text-3xl font-bold mb-6 text-primary text-left">Gold Sponsors</h2>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {grouped.gold.map((sponsor) => (
                <SponsorCard sponsor={sponsor} key={sponsor.id} />
              ))}
            </div>
          </section>
        )}

        {/* Silver Sponsors */}
        {grouped.silver.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mt-16">
            <h2 className="text-2xl font-bold mb-6 text-primary text-left">Silver Sponsors</h2>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {grouped.silver.map((sponsor) => (
                <SponsorCard sponsor={sponsor} key={sponsor.id} />
              ))}
            </div>
          </section>
        )}

        {/* Bronze Sponsors */}
        {grouped.bronze.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mt-16">
            <h2 className="text-xl font-bold mb-6 text-primary text-left">Bronze Sponsors</h2>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {grouped.bronze.map((sponsor) => (
                <SponsorCard sponsor={sponsor} key={sponsor.id} />
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section className="max-w-7xl mx-auto mt-20 px-4">
          <div className="bg-surface rounded-xl p-12 text-center border border-accent shadow-md" style={{ backgroundColor: '#232323' }}>
            <h3 className="text-2xl font-bold text-primary mb-2">Become a Sponsor</h3>
            <p className="text-text-secondary mb-4">Support the next generation of rocketeers and get your company featured here!</p>
            <a href="mailto:uoarocketryclub@gmail.com" className="button">Contact Us</a>
          </div>
        </section>
      </div>
    </main>
  );
}