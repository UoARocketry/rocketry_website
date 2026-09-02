import { unstable_cache } from "next/cache";
import type { Where } from "payload";
import type {
  Event as PayloadEvent,
  Executive as PayloadExecutive,
  JourneyItem as PayloadJourneyItem,
  Rocket as PayloadRocket,
  SiteSetting as PayloadSiteSettings,
  Sponsor as PayloadSponsor,
  SponsorTier as PayloadSponsorTier,
  Stat as PayloadStat,
  TeamRole as PayloadTeamRole,
  WhatWeDo as PayloadWhatWeDo,
} from "@/payload-types";
import { getPayloadClient } from "@/lib/payload";
import {
  getRocketStatus,
  isEventUpcoming,
  normalizeDayOnlyDate,
  sortByDate,
  sortRockets,
} from "@/lib/utils";
import type {
  AboutPayload,
  EventDetail,
  EventSummary,
  EventsOverview,
  Exec,
  ExecTeamPayload,
  Feature,
  ResourceLink,
  RocketDetail,
  RocketSummary,
  SiteSettings,
  Sponsor,
  SponsorTier,
  Stat,
  TeamRole,
} from "@/lib/site-data.types";

export type {
  AboutPayload,
  EventDetail,
  EventSummary,
  EventsOverview,
  Exec,
  ExecTeamPayload,
  Feature,
  RocketDetail,
  RocketSummary,
  SiteSettings,
  Sponsor,
  SponsorTier,
  Stat,
  TeamRole,
} from "@/lib/site-data.types";

const CONTENT_REVALIDATE_SECONDS = 300;

const PUBLISHED_STATUS_WHERE: Where = { _status: { equals: "published" } };

// Payload's Local API bypasses access control by default (overrideAccess: true),
// and `draft: false` alone does not exclude documents that only ever exist as a
// draft (no prior published version to fall back to in the main table). Every
// public-facing query must explicitly filter by `_status` to keep unpublished
// content off the site.
function withPublishedFilter(where?: Where): Where {
  return where ? { and: [where, PUBLISHED_STATUS_WHERE] } : PUBLISHED_STATUS_WHERE;
}

function parseDateValue(value: string | null | undefined): Date | null {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeEventDate(value: string | null | undefined): string {
  return parseDateValue(value)?.toISOString() ?? "";
}

/**
 * Clearing a text field in the Payload admin stores `""`, not `null`. Left as
 * it is, an emptied per-day location defeats the `?? fallback` that should
 * have inherited the session's or the event's room.
 */
function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getSessionTimestamps(event: EventSummary): number[] {
  return event.sessions
    .map((session) => parseDateValue(session.date)?.getTime())
    .filter((timestamp): timestamp is number => typeof timestamp === "number");
}

function partitionEventsByDate(events: EventSummary[]): EventsOverview {
  const now = Date.now();

  const withSortKey = events.map((event) => {
    const baseTimestamp =
      parseDateValue(event.date)?.getTime() ?? Number.MIN_SAFE_INTEGER;
    const sessionTimestamps = getSessionTimestamps(event);

    // Whether an event has finished is decided in one place, so a series, a
    // two-day event and a one-off cannot drift apart. Only the sort key
    // differs between them.
    const isUpcoming = isEventUpcoming(event);

    // A one-off or a multi-day event sorts by its first day.
    if (sessionTimestamps.length === 0) {
      return { event, timestamp: baseTimestamp, isUpcoming };
    }

    const futureSessions = sessionTimestamps.filter(
      (timestamp) => timestamp >= now,
    );

    return {
      event,
      // Sort upcoming series by their next session, finished ones by their last.
      timestamp:
        futureSessions.length > 0
          ? Math.min(...futureSessions)
          : Math.max(...sessionTimestamps),
      isUpcoming,
    };
  });

  const upcoming = withSortKey
    .filter(({ isUpcoming }) => isUpcoming)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ event }) => event);

  const past = withSortKey
    .filter(({ isUpcoming }) => !isUpcoming)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(({ event }) => event);

  return { upcoming, past };
}

function createCachedByNumberArg<T>(options: {
  keyPrefix: string;
  tags: (value: number) => string[];
  load: (value: number) => Promise<T>;
}) {
  const cache = new Map<number, () => Promise<T>>();

  return (value: number) => {
    let loader = cache.get(value);

    if (!loader) {
      loader = unstable_cache(() => options.load(value), [
        options.keyPrefix,
        String(value),
      ], {
        revalidate: CONTENT_REVALIDATE_SECONDS,
        tags: options.tags(value),
      });

      cache.set(value, loader);
    }

    return loader();
  };
}

function createCachedByStringArg<T>(options: {
  keyPrefix: string;
  tags: (value: string) => string[];
  load: (value: string) => Promise<T>;
}) {
  const cache = new Map<string, () => Promise<T>>();

  return (value: string) => {
    let loader = cache.get(value);

    if (!loader) {
      loader = unstable_cache(() => options.load(value), [options.keyPrefix, value], {
        revalidate: CONTENT_REVALIDATE_SECONDS,
        tags: options.tags(value),
      });

      cache.set(value, loader);
    }

    return loader();
  };
}

function mapRocket(doc: PayloadRocket): RocketSummary {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    image: doc.image ?? null,
    imagePosition: doc.imagePosition ?? null,
    description: doc.description ?? null,
    launchedAt: doc.launchedAt ?? null,
    featured: doc.featured ?? false,
    status: doc._status ?? null,
  };
}

function mapRocketDetail(doc: PayloadRocket): RocketDetail {
  // `gallery` is a hasMany upload, so entries arrive either as a populated
  // media object or as a bare id when depth is too shallow to resolve them.
  const galleryImages = (doc.gallery ?? [])
    .map((item) => (item && typeof item === "object" ? item.url : null))
    .filter((url): url is string => Boolean(url));

  const images = [doc.image, ...galleryImages].filter(
    (url): url is string => Boolean(url),
  );

  // Both fields are required in the CMS, but the columns are nullable and a row
  // could predate that, so drop anything half-filled rather than render a
  // blank cell in the Details grid.
  const specs = (doc.specs ?? [])
    .map((spec) => ({
      label: spec.label?.trim() ?? "",
      value: spec.value?.trim() ?? "",
    }))
    .filter((spec) => spec.label.length > 0 && spec.value.length > 0);

  return {
    ...mapRocket(doc),
    images,
    specs,
    videos: mapResourceLinks(doc.videos),
    videosHeading: blankToNull(doc.videosHeading),
    links: mapResourceLinks(doc.links),
    linksHeading: blankToNull(doc.linksHeading),
  };
}

/**
 * Labelled links, with half-filled rows dropped.
 *
 * Both fields are required in the CMS, but the columns are nullable, so a row
 * saved before that could render as a link with no text or a label that goes
 * nowhere.
 */
function mapResourceLinks(
  rows: { label?: string | null; url?: string | null }[] | null | undefined,
): ResourceLink[] {
  return (rows ?? [])
    .map((row) => ({
      label: row.label?.trim() ?? "",
      url: row.url?.trim() ?? "",
    }))
    .filter((row) => row.label.length > 0 && row.url.length > 0);
}

function mapEventDetail(doc: PayloadEvent): EventDetail {
  // `gallery` is a hasMany upload, so entries arrive either as a populated
  // media object or as a bare id when depth is too shallow to resolve them.
  const galleryImages = (doc.gallery ?? [])
    .map((item) => (item && typeof item === "object" ? item.url : null))
    .filter((url): url is string => Boolean(url));

  return {
    ...mapEvent(doc),
    // The poster leads, so the page opens on the image the cards already show.
    images: [doc.image, ...galleryImages].filter((url): url is string =>
      Boolean(url),
    ),
    links: mapResourceLinks(doc.links),
    linksHeading: blankToNull(doc.linksHeading),
  };
}

function mapEvent(doc: PayloadEvent): EventSummary {
  const eventTag =
    doc.eventTag && typeof doc.eventTag === "object"
      ? doc.eventTag.name
      : null;

  // A row with no date is an editor part-way through adding one; it would
  // otherwise render as a stray entry in the date list.
  const mapExtraDates = (
    rows:
      | {
          date?: string | null;
          startTime?: string | null;
          endTime?: string | null;
          location?: string | null;
        }[]
      | null
      | undefined,
  ) =>
    sortByDate(
      (rows ?? [])
        .map((extra) => ({
          // Day-only, so it needs re-anchoring before anything reads it in the
          // site's timezone. The times beside it are real instants and do not.
          date: extra.date ? normalizeDayOnlyDate(extra.date) : "",
          startTime: normalizeEventDate(extra.startTime) || null,
          endTime: normalizeEventDate(extra.endTime) || null,
          location: blankToNull(extra.location),
        }))
        .filter((extra) => extra.date.length > 0),
    );

  // Sorted here rather than trusted from the CMS. The admin lets rows sit in
  // any order, and the detail page reads position for the "Runs" range, the
  // "Next up" badge and which sessions are greyed out as complete — so a
  // series entered out of order rendered a backwards date range and marked
  // the wrong sessions done.
  const sessions = sortByDate(
    (doc.sessions ?? [])
      .map((session) => ({
        id: session.id ?? null,
        title: session.title,
        date: normalizeEventDate(session.date),
        endTime: normalizeEventDate(session.endTime) || null,
        extraDates: mapExtraDates(session.extraDates),
        description: session.description ?? null,
        location: blankToNull(session.location),
      }))
      .filter((session) => session.date.length > 0),
  );

  const extraDates = mapExtraDates(doc.extraDates);

  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    image: doc.image ?? null,
    description: doc.description ?? null,
    date: normalizeEventDate(doc.date),
    endTime: normalizeEventDate(doc.endTime) || null,
    extraDates,
    eventTag,
    // Documents saved before the signup selector existed carry a URL with no
    // type. Inferring the type keeps their Sign Up button rather than making
    // the render depend on the backfill having run.
    signupType: doc.signupType ?? (doc.signupUrl ? "link" : "none"),
    signupUrl: doc.signupUrl ?? null,
    signupLabel: blankToNull(doc.signupLabel),
    signupNote: doc.signupNote ?? null,
    location: blankToNull(doc.location),
    sessions,
    status: doc._status ?? null,
  };
}

function mapExec(doc: PayloadExecutive): Exec {
  return {
    id: doc.id,
    name: doc.name,
    role: doc.role,
    bio: doc.bio,
    // Headshots are optional: an exec with no photo renders as an initials
    // monogram instead. Empty string is the "no photo" signal for ExecCard.
    photo: doc.photo ?? "",
    photoPosition: doc.photoPosition ?? null,
    year: doc.year,
    linkedinUrl: doc.linkedinUrl ?? null,
  };
}

function mapFeature(doc: PayloadWhatWeDo | PayloadJourneyItem): Feature {
  return {
    title: doc.title,
    body: doc.body ?? null,
    image: doc.image ?? null,
    imagePosition: doc.imagePosition ?? null,
    variant: doc.variant ?? null,
  };
}

function mapTeamRole(doc: PayloadTeamRole): TeamRole {
  return {
    title: doc.title,
    body: doc.body ?? null,
    bullets: (doc.bullets ?? []).map((bullet) => bullet.value),
    variant: doc.variant ?? null,
  };
}

function mapStat(doc: PayloadStat): Stat {
  return {
    value: doc.value,
    label: doc.label,
  };
}

function mapSponsorTier(doc: PayloadSponsorTier): SponsorTier {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description ?? null,
    order: doc.order,
  };
}

function mapSponsor(doc: PayloadSponsor): Sponsor {
  const tier =
    doc.tier && typeof doc.tier === "object" ? mapSponsorTier(doc.tier) : null;

  return {
    id: doc.id,
    name: doc.name,
    // Typed non-null, but the column is nullable and rows published before the
    // image became mandatory may still hold null. The card then shows the
    // sponsor's initials rather than a stand-in logo.
    logo: doc.logo ?? "",
    logoPlate: doc.logoPlate ?? "light",
    url: doc.url,
    description: doc.description ?? null,
    tier,
  };
}

const getExecTeamByYear = createCachedByNumberArg<Exec[]>({
  keyPrefix: "exec-team",
  tags: (year) => ["about", "exec", `exec-year:${year}`],
  load: async (year) => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "executives",
      draft: false,
      pagination: false,
      sort: "order",
      where: withPublishedFilter({
        year: {
          equals: year,
        },
      }),
    });

    return result.docs.map((doc) => mapExec(doc as PayloadExecutive));
  },
});

const getRocketBySlugCached = createCachedByStringArg<RocketDetail | null>({
  keyPrefix: "rocket-by-slug",
  tags: (slug) => ["rockets", `rocket:${slug}`],
  load: async (slug) => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "rockets",
      draft: false,
      limit: 1,
      where: withPublishedFilter({
        slug: {
          equals: slug,
        },
      }),
    });

    const doc = result.docs[0];
    return doc ? mapRocketDetail(doc as PayloadRocket) : null;
  },
});

const getEventBySlugCached = createCachedByStringArg<EventDetail | null>({
  keyPrefix: "event-by-slug",
  tags: (slug) => ["events", `event:${slug}`],
  load: async (slug) => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "events",
      draft: false,
      limit: 1,
      where: withPublishedFilter({
        slug: {
          equals: slug,
        },
      }),
    });

    const doc = result.docs[0];
    return doc ? mapEventDetail(doc as PayloadEvent) : null;
  },
});

/** How many rockets the home page's featured strip shows at most. */
const HOME_ROCKET_LIMIT = 3;

async function findPublishedRockets(): Promise<RocketSummary[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "rockets",
    draft: false,
    pagination: false,
    where: PUBLISHED_STATUS_WHERE,
  });

  // Ordered in JS rather than by the query — see sortRockets for why a
  // `-launchedAt` sort cannot express the order we want.
  return sortRockets(result.docs.map((doc) => mapRocket(doc as PayloadRocket)));
}

export const getRocketSummaries = unstable_cache(
  async (): Promise<RocketSummary[]> => {
    const rockets = await findPublishedRockets();
    const featured = rockets.filter((rocket) => rocket.featured);

    if (featured.length > 0) {
      return featured.slice(0, HOME_ROCKET_LIMIT);
    }

    // Nothing ticked in the CMS: fall back to finished work rather than the
    // undated backlog, so the strip still shows something meaningful.
    const launched = rockets.filter(
      (rocket) => getRocketStatus(rocket) === "launched",
    );
    const fallback = launched.length > 0 ? launched : rockets;

    return fallback.slice(0, HOME_ROCKET_LIMIT);
  },
  ["rocket-summaries"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["rockets"] },
);

export const getAllRockets = unstable_cache(findPublishedRockets, [
  "all-rockets",
], { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["rockets"] });

export const getEventsOverview = unstable_cache(
  async (): Promise<EventsOverview> => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "events",
      draft: false,
      pagination: false,
      sort: "-date",
      where: PUBLISHED_STATUS_WHERE,
    });

    const docs = result.docs.map((doc) => mapEvent(doc as PayloadEvent));

    return partitionEventsByDate(docs);
  },
  ["events-overview"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["events"] },
);

export const getAboutPayload = unstable_cache(
  async (): Promise<AboutPayload> => {
    const payload = await getPayloadClient();

    const [
      execTeamPayload,
      whatWeDoResult,
      journeyResult,
      teamResult,
      statsResult,
    ] = await Promise.all([
      getExecTeamPayload(),
      payload.find({
        collection: "what-we-do",
        draft: false,
        limit: 100,
        sort: "order",
        where: PUBLISHED_STATUS_WHERE,
      }),
      payload.find({
        collection: "journey-items",
        draft: false,
        limit: 100,
        sort: "order",
        where: PUBLISHED_STATUS_WHERE,
      }),
      payload.find({
        collection: "team-roles",
        draft: false,
        limit: 100,
        sort: "order",
        where: PUBLISHED_STATUS_WHERE,
      }),
      payload.find({
        collection: "stats",
        draft: false,
        limit: 100,
        sort: "order",
        where: PUBLISHED_STATUS_WHERE,
      }),
    ]);

    return {
      executives: execTeamPayload.executives,
      whatWeDo: whatWeDoResult.docs.map((doc) =>
        mapFeature(doc as PayloadWhatWeDo),
      ),
      journey: journeyResult.docs.map((doc) =>
        mapFeature(doc as PayloadJourneyItem),
      ),
      teamStructure: teamResult.docs.map((doc) =>
        mapTeamRole(doc as PayloadTeamRole),
      ),
      stats: statsResult.docs.map((doc) => mapStat(doc as PayloadStat)),
    };
  },
  ["about-payload"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["about"] },
);

export const getExecYears = unstable_cache(
  async (): Promise<number[]> => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "executives",
      draft: false,
      pagination: false,
      sort: "-year",
      where: PUBLISHED_STATUS_WHERE,
    });

    const years = result.docs
      .map((doc) => (doc as PayloadExecutive).year)
      .filter((year) => Number.isFinite(year));

    return Array.from(new Set(years));
  },
  ["exec-years"],
  {
    revalidate: CONTENT_REVALIDATE_SECONDS,
    tags: ["about", "exec", "exec-years"],
  },
);

async function getLatestExecYear(): Promise<number> {
  const years = await getExecYears();
  return years[0] ?? new Date().getFullYear();
}

export async function getExecTeam(year?: number): Promise<Exec[]> {
  const targetYear =
    typeof year === "number" ? year : await getLatestExecYear();

  return getExecTeamByYear(targetYear);
}

export async function getExecTeamPayload(
  requestedYear?: number,
): Promise<ExecTeamPayload> {
  const availableYears = await getExecYears();
  const fallbackYear = availableYears[0] ?? new Date().getFullYear();
  const selectedYear =
    typeof requestedYear === "number" && availableYears.includes(requestedYear)
      ? requestedYear
      : fallbackYear;

  const executives = await getExecTeam(selectedYear);

  return {
    selectedYear,
    availableYears,
    executives,
  };
}

export const getSponsors = unstable_cache(
  async (): Promise<Sponsor[]> => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "sponsors",
      draft: false,
      pagination: false,
      sort: "name",
      where: PUBLISHED_STATUS_WHERE,
    });

    return result.docs.map((doc) => mapSponsor(doc as PayloadSponsor));
  },
  ["sponsors"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["sponsors"] },
);

/**
 * The sponsor tiers themselves, so the sponsors page can drive its sections
 * from the collection. Shares the `sponsors` cache tag, which both the Sponsors
 * and SponsorTiers collections already revalidate.
 *
 * SponsorTiers has no drafts enabled, so there is no `_status` to filter on.
 */
export const getSponsorTiers = unstable_cache(
  async (): Promise<SponsorTier[]> => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "sponsor-tiers",
      pagination: false,
      sort: "order",
    });

    return result.docs.map((doc) => mapSponsorTier(doc as PayloadSponsorTier));
  },
  ["sponsor-tiers"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["sponsors"] },
);

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({
      slug: "site-settings",
      draft: false,
    });

    const doc = settings as PayloadSiteSettings;

    return {
      memberJoinUrl: doc.memberJoinUrl ?? "",
      execTeamImageUrl: doc.execTeamImageUrl ?? null,
      discordUrl: doc.discordUrl ?? null,
      instagramUrl: doc.instagramUrl ?? null,
      linkedinUrl: doc.linkedinUrl ?? null,
      contactEmail: doc.contactEmail ?? null,
    };
  },
  ["site-settings"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["settings"] },
);

export async function getRocketBySlug(
  slug: string,
): Promise<RocketDetail | null> {
  return getRocketBySlugCached(slug);
}

/**
 * Draft-aware loaders used only by the admin preview flow.
 *
 * Deliberately NOT wrapped in `unstable_cache`, and deliberately not filtered
 * by `_status`. Caching these would put unpublished content into the shared
 * public cache, where the next anonymous visitor could be served it. They
 * always hit the database, and are only ever reached when Next's draft mode
 * cookie is set, which `/preview` only issues to an authenticated Payload user.
 */
export async function getRocketBySlugDraft(
  slug: string,
): Promise<RocketDetail | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "rockets",
    draft: true,
    limit: 1,
    where: { slug: { equals: slug } },
  });

  const doc = result.docs[0];
  return doc ? mapRocketDetail(doc as PayloadRocket) : null;
}

export async function getEventBySlugDraft(
  slug: string,
): Promise<EventDetail | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "events",
    draft: true,
    limit: 1,
    where: { slug: { equals: slug } },
  });

  const doc = result.docs[0];
  return doc ? mapEventDetail(doc as PayloadEvent) : null;
}

export async function getEventBySlug(
  slug: string,
): Promise<EventDetail | null> {
  return getEventBySlugCached(slug);
}
