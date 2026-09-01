import type { Metadata } from "next";
import Card from "@/components/ui/card";
import SectionFallback from "@/components/SectionFallback";
import Link from "next/link";
import {
  getAllRockets,
  getSiteSettings,
  type RocketSummary,
} from "@/lib/site-data";
import { formatDateShort, getRocketStatus } from "@/lib/utils";
import { rocketStatusBadge } from "@/components/ui/status-badge";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

type RocketItem = RocketSummary;

// Drawn coarsely so they stay legible at 20px inside the chip.
const SECTION_ICONS = {
  // Matches the "In Development" badge glyph on the cards below it.
  blueprint: "M4 4h16v16H4zM4 9h16M9 9v11",
  // An ascending flight path, for rockets that have already flown.
  launched: "M4 20L20 4M20 4h-7M20 4v7",
} as const;

/**
 * Splits the list into rockets still being worked on and rockets that have
 * flown. Built from the site's existing section-header language (icon chip,
 * bold heading, supporting line, fading rule) rather than a bare hairline, so
 * the split is obvious while scrolling.
 */
function SectionDivider({
  title,
  description,
  count,
  icon,
}: {
  readonly title: string;
  readonly description: string;
  readonly count: number;
  readonly icon: keyof typeof SECTION_ICONS;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-primary">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={SECTION_ICONS[icon]}
            />
          </svg>
        </span>
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {count} {count === 1 ? "rocket" : "rockets"}
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-4 pl-14">{description}</p>
      <div
        className="h-px bg-linear-to-r from-primary via-primary/30 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * One banded page section, matching the alternating surface/background bands
 * and top hairline the events and sponsors pages use.
 */
function PageSection({
  tone,
  children,
}: {
  readonly tone: "surface" | "background";
  readonly children: React.ReactNode;
}) {
  return (
    <section
      className={`py-24 px-4 relative ${
        tone === "surface" ? "bg-surface" : "bg-background"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

function RocketCards({ rockets }: { readonly rockets: readonly RocketItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {rockets.map((rocket, idx) => (
        <Link key={rocket.id} href={`/rockets/${rocket.slug}`} className="block">
          <Card
            image={rocket.image ?? PLACEHOLDER_IMAGE}
            imagePosition={rocket.imagePosition}
            title={rocket.name}
            date={
              rocket.launchedAt ? formatDateShort(rocket.launchedAt) : "TBA"
            }
            description={rocket.description ?? ""}
            badge={rocketStatusBadge(rocket)}
            reverse={idx % 2 === 1}
          />
        </Link>
      ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: "Our Rockets",
  description:
    "Explore the rockets designed, built, and launched by the University of Auckland Rocketry Club.",
  alternates: {
    canonical: "/rockets",
  },
};

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
  // getAllRockets already orders these scheduled → in development → launched,
  // so partitioning preserves that order inside each section.
  const inProgress = rockets.filter(
    (rocket) => getRocketStatus(rocket) !== "launched",
  );
  const launched = rockets.filter(
    (rocket) => getRocketStatus(rocket) === "launched",
  );
  // With only one group there is nothing to divide, so the headings would be
  // noise rather than orientation.
  const showDividers = inProgress.length > 0 && launched.length > 0;
  // Keeps the CTA's band alternating: two rocket sections above it end on
  // background, one ends on surface.
  const ctaTone = showDividers ? "bg-surface" : "bg-background";

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

      {/* Each group gets its own band, matching the events page, so the split
          registers before the headings are even read. */}
      {rockets.length === 0 ? (
        <PageSection tone="surface">
          <SectionFallback
            title="No rockets yet"
            description="Our rocket projects will appear here soon. Stay tuned!"
          />
        </PageSection>
      ) : !showDividers ? (
        <PageSection tone="surface">
          <RocketCards rockets={rockets} />
        </PageSection>
      ) : (
        <>
          <PageSection tone="surface">
            <SectionDivider
              title="In Progress"
              description="In design, in build, or waiting on a launch date."
              count={inProgress.length}
              icon="blueprint"
            />
            <RocketCards rockets={inProgress} />
          </PageSection>
          <PageSection tone="background">
            <SectionDivider
              title="Launched"
              description="Rockets that have already flown."
              count={launched.length}
              icon="launched"
            />
            <RocketCards rockets={launched} />
          </PageSection>
        </>
      )}

      {/* CTA Section */}
      <section className={`py-24 px-4 relative ${ctaTone}`}>
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
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
