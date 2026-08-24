import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/site-data";
import {
  findNextSessionIndex,
  formatDateLong,
  formatDateWithTime,
  isEventUpcoming,
  toSafeJsonLd,
} from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import EventHeroImage from "@/components/ui/event-hero-image";

interface EventPageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {};
  }

  const description =
    event.description ??
    `Details on ${event.title}, an event hosted by the University of Auckland Rocketry Club.`;

  return {
    title: event.title,
    description,
    alternates: {
      canonical: `/events/${slug}`,
    },
    openGraph: {
      title: event.title,
      description,
      images: event.image ? [{ url: event.image }] : undefined,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const { sessions } = event;
  const hasSessions = sessions.length > 0;
  const nextSessionIndex = findNextSessionIndex(sessions);
  const seriesStart = hasSessions ? sessions[0].date : event.date;
  const seriesEnd = hasSessions ? sessions[sessions.length - 1].date : null;

  const toPlace = (name: string | null | undefined) =>
    name ? { "@type": "Place", name, address: name } : undefined;

  const organizer = {
    "@type": "CollegeOrUniversity",
    name: "University of Auckland Rocketry Club",
    url: "https://www.uoarocketry.com",
  };

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": hasSessions ? "EventSeries" : "Event",
    name: event.title,
    description: event.description ?? undefined,
    startDate: seriesStart,
    endDate: seriesEnd ?? undefined,
    eventStatus: "https://schema.org/EventScheduledStatus",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: toPlace(event.location),
    image: event.image ?? undefined,
    organizer,
    subEvent: hasSessions
      ? sessions.map((session) => ({
          "@type": "Event",
          name: session.title,
          description: session.description ?? undefined,
          startDate: session.date,
          eventStatus: "https://schema.org/EventScheduledStatus",
          eventAttendanceMode:
            "https://schema.org/OfflineEventAttendanceMode",
          location: toPlace(session.location ?? event.location),
          organizer,
        }))
      : undefined,
  };

  return (
    <main className="min-h-screen max-w-7xl mx-auto pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonLd(eventJsonLd) }}
      />
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4">
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to all Events
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Event Image */}
          <EventHeroImage
            src={event.image ?? PLACEHOLDER_IMAGE}
            alt={event.title}
          />

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-extrabold mb-4 text-primary">
                {event.title}
              </h1>
              <div className="mb-4">
                <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border border-primary/50 text-primary bg-primary/10">
                  {event.eventTag ?? "General"}
                </span>
              </div>
              <div className="space-y-2 mb-4 text-sm sm:text-base">
                <p className="text-text-secondary leading-relaxed">
                  <span className="text-primary font-semibold">
                    {hasSessions ? "Runs:" : "Date:"}
                  </span>{" "}
                  {hasSessions
                    ? `${formatDateLong(seriesStart)} – ${formatDateLong(
                        seriesEnd ?? seriesStart,
                      )} (${sessions.length} sessions)`
                    : formatDateWithTime(event.date)}
                </p>
                <p className="text-text-secondary leading-relaxed">
                  <span className="text-primary font-semibold">Location:</span>{" "}
                  {event.location}
                </p>
              </div>
            </div>

            <p className="text-lg text-text-main leading-relaxed">
              {event.description}
            </p>

            {isEventUpcoming(event) && event.signupUrl && (
              <div className="mt-8">
                <a
                  href={event.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button bg-primary px-6 py-3 font-bold hover:bg-primary-dark transition-all duration-200"
                  style={{ color: "#ffffff" }}
                  aria-label={`Sign up for ${event.title}`}
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {hasSessions && (
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <h2 className="text-2xl font-bold mb-6 text-text-main">
            Session schedule
          </h2>
          <ol className="space-y-4">
            {sessions.map((session, sessionIndex) => {
              const isPast =
                nextSessionIndex === -1 || sessionIndex < nextSessionIndex;
              const isNext = sessionIndex === nextSessionIndex;

              return (
                <li
                  key={`${session.title}-${session.date}`}
                  className={`rounded-xl border p-5 transition-colors ${
                    isNext
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-card"
                  } ${isPast ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isNext
                          ? "bg-primary text-white"
                          : "bg-surface text-text-secondary"
                      }`}
                    >
                      {sessionIndex + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-text-main">
                      {session.title}
                    </h3>
                    {isNext && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                        Next up
                      </span>
                    )}
                    {isPast && (
                      <span className="text-xs text-text-muted">Completed</span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-1">
                    {formatDateWithTime(session.date)}
                  </p>
                  {(session.location ?? event.location) && (
                    <p className="text-sm text-text-secondary mb-1">
                      {session.location ?? event.location}
                    </p>
                  )}
                  {session.description && (
                    <p className="text-sm text-text-secondary leading-relaxed mt-2">
                      {session.description}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </main>
  );
}
