import Link from "next/link";
import Card from "@/components/ui/card";
import SectionFallback from "@/components/SectionFallback";
import EventsTagFilter from "@/components/EventsTagFilter";
import { getEventsOverview, type EventSummary } from "@/lib/site-data";

type EventLocal = EventSummary;

interface EventsPageProps {
  readonly searchParams: Promise<{ tag?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { tag } = await searchParams;
  const selectedTag = typeof tag === "string" ? tag : "all";

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

  const placeholder =
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80";

  const allTags = Array.from(
    new Set(
      [...upcoming, ...past]
        .map((event) => event.eventTag?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const filterByTag = (event: EventLocal) => {
    if (selectedTag === "all") return true;
    return (event.eventTag ?? "General") === selectedTag;
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
                selectedTag === "all"
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
                    image={event.image ?? placeholder}
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
                    image={event.image ?? placeholder}
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
        </div>
      </section>
    </main>
  );
}
