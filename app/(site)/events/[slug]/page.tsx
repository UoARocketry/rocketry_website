import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getEventBySlug, getEventBySlugDraft } from "@/lib/site-data";
import {
  findNextSessionIndex,
  formatDateLong,
  formatDateWithTime,
  formatEventWhen,
  formatTimeOfDay,
  isEventUpcoming,
  toSafeJsonLd,
} from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import DraftBanner from "@/components/ui/draft-banner";
import EventHeroImage from "@/components/ui/event-hero-image";

interface EventPageProps {
  readonly params: Promise<{ slug: string }>;
}

/**
 * Draft mode is only ever set by `/preview`, which requires a signed-in Payload
 * user. Everyone else takes the cached published path.
 */
async function loadEvent(slug: string) {
  const { isEnabled } = await draftMode();

  return isEnabled
    ? { event: await getEventBySlugDraft(slug), isDraft: true }
    : { event: await getEventBySlug(slug), isDraft: false };
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { event } = await loadEvent(slug);

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
  const { event, isDraft } = await loadEvent(slug);

  if (!event) {
    notFound();
  }

  const { sessions } = event;
  const hasSessions = sessions.length > 0;
  const nextSessionIndex = findNextSessionIndex(sessions);
  const seriesStart = hasSessions ? sessions[0].date : event.date;
  const seriesEnd = hasSessions ? sessions[sessions.length - 1].date : null;

  const when = formatEventWhen(event);

  // Only a further day is a date that can stand as an end date. An end *time*
  // is stored as a clock reading on an unrelated day, so publishing it here
  // would put a wrong instant into search results.
  const lastExtraDay =
    event.extraDates.length > 0
      ? event.extraDates[event.extraDates.length - 1].date
      : null;

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
    endDate: seriesEnd ?? lastExtraDay ?? undefined,
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
      {isDraft && <DraftBanner returnTo={`/events/${slug}`} />}
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
                {hasSessions ? (
                  <p className="text-text-secondary leading-relaxed">
                    <span className="text-primary font-semibold">Runs:</span>{" "}
                    {`${formatDateLong(seriesStart)} – ${formatDateLong(
                      seriesEnd ?? seriesStart,
                    )} (${sessions.length} sessions)`}
                  </p>
                ) : (
                  <>
                    <p className="text-text-secondary leading-relaxed">
                      <span className="text-primary font-semibold">Date:</span>{" "}
                      {when.dateLabel}
                    </p>
                    {when.timeLabel && (
                      <p className="text-text-secondary leading-relaxed">
                        <span className="text-primary font-semibold">
                          Time:
                        </span>{" "}
                        {when.timeLabel}
                      </p>
                    )}
                    {/* Only reached when the days do not share their hours,
                        which is the one case a single line cannot state. */}
                    {when.schedule.length > 0 && (
                      <div className="text-text-secondary leading-relaxed">
                        <span className="text-primary font-semibold">
                          Times:
                        </span>
                        <ul className="mt-1 space-y-1">
                          {when.schedule.map((entry) => (
                            <li key={entry.day}>
                              {entry.day}: {entry.time}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
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

              const sessionLocation = session.location ?? event.location;

              return (
                <li key={`${session.title}-${session.date}`}>
                  {/* Native <details> keeps this a server component — the next
                      session opens by default, the rest stay collapsed so a
                      long series with long descriptions isn't overwhelming. */}
                  <details
                    open={isNext}
                    className={`group rounded-xl border transition-colors ${
                      isNext
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-card"
                    } ${isPast ? "opacity-60" : ""}`}
                  >
                    <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-5 list-none [&::-webkit-details-marker]:hidden">
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
                        <span className="text-xs text-text-muted">
                          Completed
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-3">
                        <span className="text-sm text-text-secondary">
                          {formatDateWithTime(session.date)}
                          {session.endTime
                            ? ` – ${formatTimeOfDay(session.endTime)}`
                            : ""}
                        </span>
                        <svg
                          className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-90"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-5 pb-5 pl-15 space-y-1">
                      {sessionLocation && (
                        <p className="text-sm text-text-secondary">
                          {sessionLocation}
                        </p>
                      )}
                      {session.description ? (
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {session.description}
                        </p>
                      ) : (
                        !sessionLocation && (
                          <p className="text-sm text-text-muted">
                            No further details for this session.
                          </p>
                        )
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </main>
  );
}
