import React from "react";
import Link from "next/link";
import Card from "../components/ui/card";
import SectionFallback from "../components/SectionFallback";
import QuickNavCard from "../components/QuickNavCard";
import { getEventsOverview, getRocketSummaries } from "@/lib/site-data";

type Rocket = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  launchedAt?: string | null;
};

type EventItem = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  date: string;
  eventTag?: string | null;
};

export default async function HomePage() {
  let featuredRockets: Rocket[] = [];
  let latestEvents: EventItem[] = [];

  try {
    const [rockets, events] = await Promise.all([
      getRocketSummaries(),
      getEventsOverview(),
    ]);

    featuredRockets = rockets;
    latestEvents = events.upcoming;
  } catch (err) {
    console.error("Failed to load homepage data", err);
  }

  const eventPlaceholder =
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80";

  return (
    <main className="min-h-screen bg-background text-text-main">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 bg-background overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <img
            src="/UARC logo.png"
            alt="UARC Logo"
            className="h-20 md:h-24 mb-8 mx-auto"
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-balance">
            University of Auckland
            <span className="block text-primary">Rocketry Club</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed text-pretty">
            We give students the opportunity to design, build and fly rockets as
            we explore the exciting world of aerospace engineering together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="https://docs.google.com/forms/d/e/1FAIpQLSfS7PS--UX-fQinUfuYzVLV3-rM92cW7uVFOqoEVczgYLb8Qg/viewform?usp=sf_link"
              className="bg-primary hover:bg-primary-dark text-base px-8 py-3.5 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
              style={{ color: "#ffffff" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join The Club
            </Link>
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
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
                    image={rocket.image ?? ""}
                    title={rocket.name}
                    date={
                      rocket.launchedAt
                        ? new Date(rocket.launchedAt).toLocaleDateString()
                        : "TBA"
                    }
                    description={rocket.description ?? ""}
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
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {latestEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block"
                >
                  <Card
                    image={eventPlaceholder}
                    title={event.title}
                    date={new Date(event.date).toLocaleDateString()}
                    tag={event.eventTag ?? "General"}
                    description={event.description ?? ""}
                    vertical
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
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
