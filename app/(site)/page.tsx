import React from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/card";
import SectionFallback from "@/components/SectionFallback";
import QuickNavCard from "@/components/QuickNavCard";
import { rocketStatusBadge } from "@/components/ui/status-badge";
import {
  getEventsOverview,
  getRocketSummaries,
  getSiteSettings,
  type EventSummary,
  type RocketSummary,
} from "@/lib/site-data";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";

export default async function HomePage() {
  let featuredRockets: RocketSummary[] = [];
  let latestEvents: EventSummary[] = [];
  let joinUrl = "";

  try {
    const [rockets, events, settings] = await Promise.all([
      getRocketSummaries(),
      getEventsOverview(),
      getSiteSettings(),
    ]);

    featuredRockets = rockets;
    latestEvents = events.upcoming.slice(0, 4);
    joinUrl = settings.memberJoinUrl;
  } catch (error) {
    console.error("[app/home] Failed to load homepage data:", error);
  }

  const hasJoinUrl = Boolean(joinUrl.trim());

  return (
    <main className="min-h-screen bg-background text-text-main">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 bg-background overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-200 h-200 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <Image
            src="/UARC logo.png"
            alt="UARC Logo"
            width={360}
            height={144}
            className="h-20 md:h-24 mb-8 mx-auto"
            priority
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-balance">
            University of Auckland
            <span className="block text-primary">Rocketry Club</span>
          </h1>
          {/* The acronym is spelled out here on purpose: it is the term people
              search for, and it previously appeared nowhere in visible text. */}
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed text-pretty">
            UARC gives students the opportunity to design, build and fly rockets
            as we explore the exciting world of aerospace engineering together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {hasJoinUrl && (
              <Link
                href={joinUrl}
                className="bg-primary hover:bg-primary-dark text-base px-8 py-3.5 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
                style={{ color: "#ffffff" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join The Club
              </Link>
            )}
            <Link
              href="/rockets"
              className="bg-transparent border border-border hover:border-primary/50 text-text-main hover:text-primary text-base px-8 py-3.5 rounded-lg font-semibold transition-all duration-200 hover:bg-primary/5"
            >
              View Our Rockets
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Featured Rockets Section */}
      <section className="py-24 px-4 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              Our Projects
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Rockets
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Explore our latest rocket projects and engineering achievements.
            </p>
          </div>
          {featuredRockets.length === 0 ? (
            <SectionFallback />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {featuredRockets.map((rocket, idx) => (
                <Link
                  key={rocket.id}
                  href={`/rockets/${rocket.slug}`}
                  className="block"
                >
                  <Card
                    image={rocket.image ?? PLACEHOLDER_IMAGE}
                    imagePosition={rocket.imagePosition}
                    title={rocket.name}
                    date={
                      rocket.launchedAt
                        ? formatDateShort(rocket.launchedAt)
                        : "TBA"
                    }
                    description={rocket.description ?? ""}
                    badge={rocketStatusBadge(rocket)}
                    reverse={idx % 2 === 1}
                  />
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              href="/rockets"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-medium transition-colors duration-200"
            >
              View all rockets
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
          </div>
        </div>
      </section>

      {/* Latest Events Section */}
      <section className="py-24 px-4 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              Stay Updated
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Upcoming Events
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Join our next events and be part of the excitement.
            </p>
          </div>
          {latestEvents.length === 0 ? (
            <SectionFallback
              title="No upcoming events"
              description="We do not have any future events scheduled yet. Check back soon for new workshops, talks, and launch activities."
            />
          ) : (
            <div
              className={
                // A lone card would otherwise sit in the left column. Narrowing
                // the grid to one column's width (half, less the 1.5rem gap)
                // and centring it keeps the card exactly the same size.
                //
                // The two variants must be mutually exclusive: appending
                // `sm:grid-cols-1` alongside `sm:grid-cols-2` does not override
                // it, since equal-specificity Tailwind classes are resolved by
                // stylesheet order, not class-attribute order.
                latestEvents.length === 1
                  ? "grid gap-6 grid-cols-1 sm:max-w-[calc(50%-0.75rem)] sm:mx-auto"
                  : "grid gap-6 grid-cols-1 sm:grid-cols-2"
              }
            >
              {latestEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block"
                >
                  <Card
                    image={event.image ?? PLACEHOLDER_IMAGE}
                    title={event.title}
                    date={formatDateShort(event.date)}
                    tag={event.eventTag ?? "General"}
                    description={event.description ?? ""}
                    vertical
                    poster
                  />
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-medium transition-colors duration-200"
            >
              View all events
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
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-24 px-4 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
            Thank You
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Sponsors</h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-10">
            We are grateful for the generous support of our sponsors who make
            our rocketry projects possible.
          </p>
          <Link
            href="/sponsors"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
            style={{ color: "#ffffff" }}
          >
            View Our Sponsors
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
        </div>
      </section>

      {/* Quick Navigation Section */}
      <section className="py-24 px-4 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
              Discover
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore More
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Discover everything the University of Auckland Rocketry Club has
              to offer.
            </p>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <QuickNavCard
              href="/about"
              icon="info"
              title="About"
              description="Learn about the club and our mission"
            />
            <QuickNavCard
              href="/events"
              icon="calendar"
              title="Events"
              description="Check out upcoming events and competitions"
            />
            <QuickNavCard
              href="/rockets"
              icon="rocket"
              title="Our Rockets"
              description="View our rocket projects and achievements"
            />
            <QuickNavCard
              href="/sponsors"
              icon="heart"
              title="Sponsors"
              description="Meet our generous sponsors"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
