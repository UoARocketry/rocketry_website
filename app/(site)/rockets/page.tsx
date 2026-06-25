import Card from "@/components/ui/card";
import SectionFallback from "@/components/SectionFallback";
import Link from "next/link";
import {
  getAllRockets,
  getSiteSettings,
  type RocketSummary,
} from "@/lib/site-data";
import { formatDateShort } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

type RocketItem = RocketSummary;

export default async function RocketsPage() {
  let rockets: RocketItem[] = [];
  let joinUrl = "";

  try {
    const [rocketsData, settings] = await Promise.all([
      getAllRockets(),
      getSiteSettings(),
    ]);
    rockets = rocketsData;
    joinUrl = settings.memberJoinUrl;
  } catch (error) {
    console.error("[app/rockets] Failed to load rockets data:", error);
  }

  const hasJoinUrl = Boolean(joinUrl.trim());

  return (
    <main className="min-h-screen bg-background text-text-main">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 bg-background overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
            Our Fleet
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Rockets</h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            Explore our rocket projects and engineering achievements. Each
            rocket represents countless hours of design, testing, and innovation
            by our team members.
          </p>
        </div>
      </section>

      {/* Rockets Grid Section */}
      <section className="py-24 px-4 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          {rockets.length === 0 ? (
            <SectionFallback
              title="No rockets yet"
              description="Our rocket projects will appear here soon. Stay tuned!"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {rockets.map((rocket: RocketItem, idx: number) => (
                <Link
                  key={rocket.id}
                  href={`/rockets/${rocket.slug}`}
                  className="block"
                >
                  <Card
                    image={rocket.image ?? PLACEHOLDER_IMAGE}
                    title={rocket.name}
                    date={
                      rocket.launchedAt
                        ? formatDateShort(rocket.launchedAt)
                        : "TBA"
                    }
                    description={rocket.description ?? ""}
                    reverse={idx % 2 === 1}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-card rounded-2xl p-10 text-center border border-border overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-3">
                Want to Build Rockets?
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Join our team and contribute to the next generation of
                student-built rockets.
              </p>
              {hasJoinUrl && (
                <Link
                  href={joinUrl}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                  style={{ color: "#ffffff" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join UARC
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
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
