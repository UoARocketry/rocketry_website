import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/card";
import SectionFallback from "@/components/SectionFallback";
import EventsTagFilter from "@/components/EventsTagFilter";
import { getEventsOverview, type EventSummary } from "@/lib/site-data";
import {
  ALL_EVENTS_TAG,
  formatEventCardDate,
  formatEventSessionsLabel,
  formatEventTagLabel,
  normalizeEventTag,
  normalizeEventTagParam,
} from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

type EventLocal = EventSummary;

export const metadata: Metadata = {
  title: "Events",
  description:
    "See upcoming and past events from the University of Auckland Rocketry Club, including launches, workshops, and meetups.",
  alternates: {
    canonical: "/events",
  },
};

interface EventsPageProps {
  readonly searchParams: Promise<{ tag?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { tag } = await searchParams;
  const selectedTag = normalizeEventTagParam(tag);

  let upcoming: EventLocal[] = [];
  let past: EventLocal[] = [];

  try {
    const data = await getEventsOverview();
    upcoming = data.upcoming;
    past = data.past;
  } catch (error) {
    console.error("[app/events] Failed to load events data:", error);
    upcoming = [];
    past = [];
  }

  const tagMap = new Map<string, string>();

  for (const event of [...upcoming, ...past]) {
    const label = formatEventTagLabel(event.eventTag);
    const value = normalizeEventTag(event.eventTag);

    if (!tagMap.has(value)) {
      tagMap.set(value, label);
    }
  }

  const allTags = Array.from(tagMap, ([value, label]) => ({
    value,
    label,
  })).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );

  const filterByTag = (event: EventLocal) => {
    if (selectedTag === ALL_EVENTS_TAG) return true;
    return normalizeEventTag(event.eventTag) === selectedTag;
  };

  const filteredUpcoming = upcoming.filter(filterByTag);
  const filteredPast = past.filter(filterByTag);

  return (
    <main className="min-h-screen bg-background text-text-main">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 bg-background overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
            Stay Connected
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Events</h1>
          <p className="text-lg text-text-secondary max-w-2xl mb-8">
            Discover and join our upcoming and past events! From launches to
            workshops, our events are open to all members and enthusiasts.
          </p>
          <EventsTagFilter selectedTag={selectedTag} allTags={allTags} />
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-24 px-4 bg-surface relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-2">
              Coming Up
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">Upcoming Events</h2>
          </div>
          {filteredUpcoming.length === 0 ? (
            <SectionFallback
              align="left"
              title="No upcoming events"
              description={
                selectedTag === ALL_EVENTS_TAG
                  ? "There are currently no future events scheduled. Check back soon."
                  : "No events match this filter. Try switching to All Tags."
              }
            />
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {filteredUpcoming.map((event: EventLocal) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block"
                >
                  <Card
                    image={event.image ?? PLACEHOLDER_IMAGE}
                    title={event.title}
                    date={formatEventCardDate(event)}
                    tag={formatEventTagLabel(event.eventTag)}
                    meta={formatEventSessionsLabel(event)}
                    description={event.description ?? ""}
                    vertical
                    poster
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      <section className="py-24 px-4 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-text-muted text-sm font-medium uppercase tracking-wider mb-2">
              Archive
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">Past Events</h2>
          </div>
          {filteredPast.length === 0 ? (
            <SectionFallback
              align="left"
              title="No past events"
              description="Past events will appear here."
            />
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {filteredPast.map((event: EventLocal) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block"
                >
                  <Card
                    image={event.image ?? PLACEHOLDER_IMAGE}
                    title={event.title}
                    date={formatEventCardDate(event)}
                    tag={formatEventTagLabel(event.eventTag)}
                    meta={formatEventSessionsLabel(event)}
                    description={event.description ?? ""}
                    vertical
                    poster
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
