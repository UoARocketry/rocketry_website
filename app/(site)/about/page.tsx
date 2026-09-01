import type { Metadata } from "next";
import Link from "next/link";
import FeatureCard from "@/components/FeatureCard";
import StatCard from "@/components/StatCard";
import SectionFallback from "@/components/SectionFallback";
import ImageWithLoader from "@/components/ImageWithLoader";
import ExecTeamSection from "@/components/ExecTeamSection";
import {
  getAboutPayload,
  getExecTeamPayload,
  type AboutPayload,
  type Exec,
  getSiteSettings,
} from "@/lib/site-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Meet the team behind the University of Auckland Rocketry Club, learn what we do, and see our journey building and launching student rockets.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  let executives: Exec[] = [];
  let selectedExecYear = new Date().getFullYear();
  let execYears: number[] = [];
  let execsError = false;

  let whatWeDo: AboutPayload["whatWeDo"] = [];
  let journey: AboutPayload["journey"] = [];
  let teamStructure: AboutPayload["teamStructure"] = [];
  let stats: AboutPayload["stats"] = [];
  let joinUrl = "";
  let teamImageUrl: string | null = null;

  try {
    const [payload, settings, execTeamPayload] = await Promise.all([
      getAboutPayload(),
      getSiteSettings(),
      getExecTeamPayload(),
    ]);

    const safeExecTeam =
      execTeamPayload && typeof execTeamPayload === "object"
        ? execTeamPayload
        : {
            executives: [],
            selectedYear: new Date().getFullYear(),
            availableYears: [],
          };

    const normalizedExecs = Array.isArray(safeExecTeam.executives)
      ? safeExecTeam.executives
      : [];

    executives = normalizedExecs.length ? normalizedExecs : payload.executives;
    selectedExecYear = safeExecTeam.selectedYear;
    execYears = Array.isArray(safeExecTeam.availableYears)
      ? safeExecTeam.availableYears
      : [];
    whatWeDo = payload.whatWeDo;
    journey = payload.journey;
    teamStructure = payload.teamStructure;
    stats = payload.stats;
    joinUrl = settings.memberJoinUrl;
    teamImageUrl = settings.execTeamImageUrl ?? null;
  } catch (error) {
    console.error("[app/about] Failed to load about data:", error);
    execsError = true;
  }

  const hasJoinUrl = Boolean(joinUrl.trim());

  return (
    <main className="min-h-screen bg-background text-text-main">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 bg-background overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          {teamImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              <ImageWithLoader
                src={teamImageUrl}
                alt="UARC Team"
                width={2160}
                height={1215}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 1200px"
                priority
                className="w-full h-auto object-cover"
                containerClassName="relative"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          ) : (
            <div className="rounded-2xl bg-surface h-72 md:h-96" />
          )}
        </div>
      </section>

      {/* What Do We Do Section */}
      <section className="py-24 px-4 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              Our Activities
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Do We Do?
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              We offer a variety of activities to help students learn, network,
              and grow in the field of rocketry.
            </p>
          </div>
          {whatWeDo.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whatWeDo.map((w) => (
                <FeatureCard
                  key={w.title}
                  image={w.image ?? undefined}
                  imagePosition={w.imagePosition}
                  imageAlt={w.title}
                  title={w.title}
                  centered={true}
                  showImagePlaceholder={true}
                  variant={w.variant as "background" | "surface"}
                >
                  {w.body}
                </FeatureCard>
              ))}
            </div>
          ) : (
            <SectionFallback />
          )}
        </div>
      </section>

      {/* History Section */}
      <section className="py-24 px-4 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              Our Story
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              From humble beginnings to launching rockets that reach new
              heights.
            </p>
          </div>
          {journey.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {journey.map((j) => (
                <FeatureCard
                  key={j.title}
                  image={j.image ?? undefined}
                  imagePosition={j.imagePosition}
                  imageAlt={j.title}
                  title={j.title}
                  showImagePlaceholder={true}
                  variant={j.variant as "background" | "surface"}
                >
                  {j.body}
                </FeatureCard>
              ))}
            </div>
          ) : (
            <SectionFallback />
          )}
        </div>
      </section>

      {/* Executive Team Section */}
      <section className="py-24 px-4 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              Meet The Team
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Executive Team
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Meet the dedicated leaders driving UARC forward with their passion
              for rocketry and aerospace engineering.
            </p>
          </div>
          <ExecTeamSection
            initialYear={selectedExecYear}
            initialYears={execYears}
            initialExecutives={executives}
            initialLoadError={execsError}
          />
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-24 px-4 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              By The Numbers
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Achievements
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Milestones that showcase our commitment to excellence in rocketry.
            </p>
          </div>
          {stats.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <StatCard
                  key={s.label}
                  value={s.value}
                  label={s.label}
                  centered={true}
                  variant="background"
                />
              ))}
            </div>
          ) : (
            <SectionFallback />
          )}
        </div>
      </section>

      {/* Team Structure Section */}
      <section className="py-24 px-4 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              How We Work
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Team Structure
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Organised teams working together to achieve our rocketry goals.
            </p>
          </div>
          {teamStructure.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamStructure.map((t) => (
                <FeatureCard
                  key={t.title}
                  title={t.title}
                  variant={t.variant as "surface" | "background"}
                >
                  <p className="mb-4 whitespace-pre-line">{t.body}</p>
                  {t.bullets && (
                    <ul className="text-text-secondary text-sm space-y-2">
                      {t.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </FeatureCard>
              ))}
            </div>
          ) : (
            <SectionFallback />
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-4 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-card rounded-2xl p-10 text-center border border-border overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-3">
                Ready to Join?
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Whether you&apos;re an experienced engineer or just starting
                your journey in aerospace, there&apos;s a place for you in UARC.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {hasJoinUrl && (
                  <Link
                    href={joinUrl}
                    className="bg-primary hover:bg-primary-dark px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                    style={{ color: "#ffffff" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Become a Member
                  </Link>
                )}
                <Link
                  href="/events"
                  className="bg-transparent border border-border hover:border-primary/50 text-text-main hover:text-primary px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Attend an Event
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
