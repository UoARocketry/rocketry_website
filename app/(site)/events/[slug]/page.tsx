import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getEventBySlug, getEventBySlugDraft } from "@/lib/site-data";
import {
  findNextSessionIndex,
  formatDateLong,
  formatEventWhen,
  getSeriesEndDate,
  isEventUpcoming,
  toSafeJsonLd,
} from "@/lib/utils";
import DraftBanner from "@/components/ui/draft-banner";
import EventHeroImage from "@/components/ui/event-hero-image";
import LocationPin from "@/components/ui/location-pin";
import ScheduleList from "@/components/ui/schedule-list";

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
  // Not the last session's own date: a session carrying extra days runs past
  // it, so a series ending in a two-day workshop reported the wrong end.
  const seriesEnd = hasSessions ? getSeriesEndDate(sessions) : null;

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
    // An event with no date of its own still has sessions; without either,
    // publishing an empty string would be worse than publishing nothing.
    startDate: seriesStart || undefined,
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
      {isDraft && (
        <DraftBanner
          returnTo={`/events/${slug}`}
          isPublished={event.status === "published"}
        />
      )}
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
            src={event.image}
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
              {/* A series shows everything a one-off does. Its own date, hours
                  and room are real details an editor filled in, and hiding
                  them behind the session list lost them. `Runs:` is the extra
                  a series earns, not a replacement. */}
              <div className="space-y-2 mb-4 text-sm sm:text-base">
                {/* Optional: a series can leave its own date empty and let the
                    sessions carry every date. */}
                {when.dateLabel && (
                  <p className="text-text-secondary leading-relaxed">
                    <span className="text-primary font-semibold">Date:</span>{" "}
                    {when.dateLabel}
                  </p>
                )}
                {when.timeLabel && (
                  <p className="text-text-secondary leading-relaxed">
                    <span className="text-primary font-semibold">Time:</span>{" "}
                    {when.timeLabel}
                  </p>
                )}
                {/* Null as soon as the days disagree, in which case each one
                    names its own room in the list below instead. */}
                {when.locationLabel && (
                  <p className="flex items-center gap-2 text-text-secondary leading-relaxed">
                    <span className="text-primary font-semibold">
                      Location:
                    </span>
                    <LocationPin className="h-4 w-4 shrink-0 text-primary" />
                    {when.locationLabel}
                  </p>
                )}
                {/* Only reached when the days disagree on their hours or
                    their room, which is what a single line cannot state. */}
                {when.schedule.length > 0 && (
                  <div className="text-text-secondary leading-relaxed">
                    <span className="text-primary font-semibold">
                      {/* One day with two sittings is not "each day". */}
                      {when.schedule.length > 1 ? "Each day:" : "Times:"}
                    </span>
                    <div className="mt-1.5">
                      <ScheduleList entries={when.schedule} indented />
                    </div>
                  </div>
                )}
                {hasSessions && (
                  <p className="text-text-secondary leading-relaxed">
                    <span className="text-primary font-semibold">Runs:</span>{" "}
                    {`${formatDateLong(seriesStart)} – ${formatDateLong(
                      seriesEnd ?? seriesStart,
                    )} (${sessions.length} sessions)`}
                  </p>
                )}
              </div>
            </div>

            <p className="whitespace-pre-line text-lg text-text-main leading-relaxed">
              {event.description}
            </p>

            {/* Signup only makes sense while the event is still to run. Some
                events have no link to give, only an instruction, so the text
                variant is styled as a panel rather than a dead button. */}
            {isEventUpcoming(event) &&
              event.signupType === "link" &&
              event.signupUrl && (
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

            {isEventUpcoming(event) &&
              event.signupType === "text" &&
              event.signupNote && (
                <div className="mt-8 rounded-lg border border-primary/30 bg-primary/10 px-5 py-4">
                  <p className="text-sm font-medium text-primary">
                    {event.signupNote}
                  </p>
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
              // A session has the same shape as an event's own "when", so it
              // gets the same formatting: one day keeps its weekday, several
              // collapse to "September 3 & 4" with the hours stated once.
              // The resolved location goes in so that a day without one of its
              // own inherits the room the session actually uses, rather than
              // showing blank beside the days that do differ.
              const sessionWhen = formatEventWhen({
                ...session,
                location: sessionLocation,
              });

              // Once the days name their own rooms, repeating one of them
              // underneath as *the* session location just reads as a
              // contradiction.
              const hasPerDayLocations = sessionWhen.schedule.some((entry) =>
                entry.slots.some((slot) => slot.location),
              );

              // Payload's row id, which two sessions cannot share. Title and
              // date can: a series runs a 3D printing and a laser cutting
              // workshop on the same afternoon.
              return (
                <li
                  key={
                    session.id ??
                    `${session.title}-${session.date}-${sessionIndex}`
                  }
                >
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
                          {sessionWhen.dateLabel}
                          {sessionWhen.timeLabel
                            ? `, ${sessionWhen.timeLabel}`
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
                    <div className="px-5 pb-5 pl-15">
                      {/* When and where sit together in their own panel so the
                          facts read as a block rather than running into the
                          description as one undifferentiated column of text. */}
                      {(sessionWhen.schedule.length > 0 || sessionLocation) && (
                        <div className="rounded-lg border border-border bg-surface/60 px-4 py-3">
                          {/* Only when the session's days disagree on their
                              hours or their room, which the summary cannot
                              say. Each day carries its own pin. */}
                          {sessionWhen.schedule.length > 0 && (
                            <ScheduleList entries={sessionWhen.schedule} />
                          )}
                          {sessionWhen.schedule.length > 0 &&
                            !hasPerDayLocations &&
                            sessionLocation && (
                              <hr className="my-3 border-border" />
                            )}
                          {/* One room for the whole session. Suppressed once
                              the days name their own, which they only do when
                              they genuinely differ. */}
                          {!hasPerDayLocations && sessionLocation && (
                            <p className="flex items-start gap-2 text-sm text-text-secondary">
                              <LocationPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>
                                <span className="sr-only">Location: </span>
                                {sessionLocation}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                      {session.description ? (
                        <p className="mt-4 whitespace-pre-line text-sm text-text-secondary leading-relaxed">
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
