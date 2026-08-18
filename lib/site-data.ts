import { unstable_cache } from "next/cache";
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

function parseDateValue(value: string | null | undefined): Date | null {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeEventDate(value: string | null | undefined): string {
  return parseDateValue(value)?.toISOString() ?? "";
}

function partitionEventsByDate(events: EventSummary[]): EventsOverview {
  const now = Date.now();

  const withSortKey = events.map((event) => {
    const parsedDate = parseDateValue(event.date);
    const timestamp = parsedDate?.getTime() ?? Number.MIN_SAFE_INTEGER;

    return { event, timestamp };
  });

  const upcoming = withSortKey
    .filter(({ timestamp }) => timestamp >= now)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ event }) => event);

  const past = withSortKey
    .filter(({ timestamp }) => timestamp < now)
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
  };
}

function mapExec(doc: PayloadExecutive): Exec {
  return {
    id: doc.id,
    name: doc.name,
    role: doc.role,
    bio: doc.bio,
    photo: doc.photo,
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
    logo: doc.logo,
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
      where: {
        year: {
          equals: year,
        },
      },
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
      where: {
        slug: {
          equals: slug,
        },
      },
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
      where: {
        slug: {
          equals: slug,
        },
      },
    });

    const doc = result.docs[0];
    return doc ? mapEvent(doc as PayloadEvent) : null;
  },
});

export const getRocketSummaries = unstable_cache(
  async (): Promise<RocketSummary[]> => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "rockets",
      draft: false,
      limit: 2,
      sort: "-launchedAt",
    });

    return result.docs.map((doc) => mapRocket(doc as PayloadRocket));
  },
  ["rocket-summaries"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["rockets"] },
);

export const getAllRockets = unstable_cache(
  async (): Promise<RocketSummary[]> => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "rockets",
      draft: false,
      pagination: false,
      sort: "-launchedAt",
    });

    return result.docs.map((doc) => mapRocket(doc as PayloadRocket));
  },
  ["all-rockets"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["rockets"] },
);

export const getEventsOverview = unstable_cache(
  async (): Promise<EventsOverview> => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "events",
      draft: false,
      pagination: false,
      sort: "-date",
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
      }),
      payload.find({
        collection: "journey-items",
        draft: false,
        limit: 100,
        sort: "order",
      }),
      payload.find({
        collection: "team-roles",
        draft: false,
        limit: 100,
        sort: "order",
      }),
      payload.find({
        collection: "stats",
        draft: false,
        limit: 100,
        sort: "order",
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
