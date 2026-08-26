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
import { getRocketStatus, sortRockets } from "@/lib/utils";
import type {
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

    // One-off events keep the original behaviour: a single date decides
    // everything.
    if (sessionTimestamps.length === 0) {
      return {
        event,
        timestamp: baseTimestamp,
        isUpcoming: baseTimestamp >= now,
      };
    }

    // A series stays "upcoming" until its final session has passed, so a
    // term-long workshop doesn't drop into the archive after week one.
    const futureSessions = sessionTimestamps.filter(
      (timestamp) => timestamp >= now,
    );
    const isUpcoming = futureSessions.length > 0;

    return {
      event,
      // Sort upcoming series by their next session, finished ones by their last.
      timestamp: isUpcoming
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
    description: doc.description ?? null,
    launchedAt: doc.launchedAt ?? null,
    featured: doc.featured ?? false,
  };
}

function mapRocketDetail(doc: PayloadRocket): RocketDetail {
  const galleryImages = (doc.gallery ?? [])
    .map((item) =>
      item.image && typeof item.image === "object" ? item.image.url : null,
    )
    .filter((url): url is string => Boolean(url));

  const images = [doc.image, ...galleryImages].filter(
    (url): url is string => Boolean(url),
  );

  return {
    ...mapRocket(doc),
    images,
  };
}

function mapEvent(doc: PayloadEvent): EventSummary {
  const eventTag =
    doc.eventTag && typeof doc.eventTag === "object"
      ? doc.eventTag.name
      : null;

  const sessions = (doc.sessions ?? [])
    .map((session) => ({
      title: session.title,
      date: normalizeEventDate(session.date),
      description: session.description ?? null,
      location: session.location ?? null,
    }))
    .filter((session) => session.date.length > 0);

  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    image: doc.image ?? null,
    description: doc.description ?? null,
    date: normalizeEventDate(doc.date),
    eventTag,
    signupUrl: doc.signupUrl ?? null,
    location: doc.location ?? null,
    sessions,
  };
}

function mapExec(doc: PayloadExecutive): Exec {
  return {
    id: doc.id,
    name: doc.name,
    role: doc.role,
    bio: doc.bio,
    // Typed non-null, but the column is nullable and rows published before the
    // image became mandatory may still hold null. Cards fall back to the logo.
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
    // image became mandatory may still hold null. Cards fall back to the logo.
    logo: doc.logo ?? "",
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
    return doc ? mapEvent(doc as PayloadEvent) : null;
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

export async function getEventBySlug(
  slug: string,
): Promise<EventDetail | null> {
  return getEventBySlugCached(slug);
}
