import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";

const CONTENT_REVALIDATE_SECONDS = 300;

type PayloadDoc<T> = T & { id: number | string };

type PayloadRocket = {
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  launchedAt?: string | null;
};

type PayloadEvent = {
  title: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  date?: string | null;
  eventTag?: string | null;
  signupUrl?: string | null;
  isPast?: boolean | null;
  location?: string | null;
};

type PayloadExecutive = {
  name: string;
  role: string;
  bio: string;
  photo: string;
  year: number;
  order: number;
  linkedinUrl?: string | null;
};

type PayloadFeature = {
  title: string;
  body?: string | null;
  image?: string | null;
  variant?: "background" | "surface" | null;
  order: number;
};

type PayloadTeamRole = {
  title: string;
  body?: string | null;
  bullets?: Array<{ value: string }> | null;
  variant?: "background" | "surface" | null;
  order: number;
};

type PayloadStat = {
  value: string;
  label: string;
  order: number;
};

type PayloadSponsor = {
  name: string;
  logo: string;
  url: string;
  description?: string | null;
  tier?: "GOLD" | "SILVER" | "BRONZE" | null;
};

type PayloadSiteSettings = {
  memberJoinUrl?: string | null;
  execTeamImageUrl?: string | null;
};

export type RocketSummary = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  launchedAt?: string | null;
};

export type RocketDetail = RocketSummary;

export type EventSummary = {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  date: string;
  eventTag?: string | null;
  signupUrl?: string | null;
  isPast?: boolean;
  location?: string | null;
};

export type EventDetail = EventSummary;

export type Exec = {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo: string;
  year: number;
  linkedinUrl?: string | null;
};

export type Feature = {
  image?: string | null;
  title: string;
  body?: string | null;
  variant?: "background" | "surface" | null;
};

export type TeamRole = {
  title: string;
  body?: string | null;
  bullets?: string[];
  variant?: "background" | "surface" | null;
};

export type Stat = {
  value: string;
  label: string;
};

export type Sponsor = {
  id: number;
  name: string;
  logo: string;
  url: string;
  description?: string | null;
  tier?: string | null;
};

export type EventsOverview = {
  upcoming: EventSummary[];
  past: EventSummary[];
};

export type AboutPayload = {
  executives: Exec[];
  whatWeDo: Feature[];
  journey: Feature[];
  teamStructure: TeamRole[];
  stats: Stat[];
};

export type ExecTeamPayload = {
  selectedYear: number;
  availableYears: number[];
  executives: Exec[];
};

export type SiteSettings = {
  memberJoinUrl: string;
  execTeamImageUrl?: string | null;
};

function toNumberId(id: number | string): number {
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapRocket(doc: PayloadDoc<PayloadRocket>): RocketSummary {
  return {
    id: toNumberId(doc.id),
    name: doc.name,
    slug: doc.slug,
    image: doc.image ?? null,
    description: doc.description ?? null,
    launchedAt: doc.launchedAt ?? null,
  };
}

function mapEvent(doc: PayloadDoc<PayloadEvent>): EventSummary {
  return {
    id: toNumberId(doc.id),
    title: doc.title,
    slug: doc.slug,
    image: doc.image ?? null,
    description: doc.description ?? null,
    date: doc.date ?? "",
    eventTag: doc.eventTag ?? null,
    signupUrl: doc.signupUrl ?? null,
    isPast: Boolean(doc.isPast),
    location: doc.location ?? null,
  };
}

function mapExec(doc: PayloadDoc<PayloadExecutive>): Exec {
  return {
    id: toNumberId(doc.id),
    name: doc.name,
    role: doc.role,
    bio: doc.bio,
    photo: doc.photo,
    year: doc.year,
    linkedinUrl: doc.linkedinUrl ?? null,
  };
}

function mapFeature(doc: PayloadDoc<PayloadFeature>): Feature {
  return {
    title: doc.title,
    body: doc.body ?? null,
    image: doc.image ?? null,
    variant: doc.variant ?? null,
  };
}

function mapTeamRole(doc: PayloadDoc<PayloadTeamRole>): TeamRole {
  return {
    title: doc.title,
    body: doc.body ?? null,
    bullets: (doc.bullets ?? []).map((bullet) => bullet.value),
    variant: doc.variant ?? null,
  };
}

function mapStat(doc: PayloadDoc<PayloadStat>): Stat {
  return {
    value: doc.value,
    label: doc.label,
  };
}

function mapSponsor(doc: PayloadDoc<PayloadSponsor>): Sponsor {
  return {
    id: toNumberId(doc.id),
    name: doc.name,
    logo: doc.logo,
    url: doc.url,
    description: doc.description ?? null,
    tier: doc.tier ?? null,
  };
}

export const getRocketSummaries = unstable_cache(
  async (): Promise<RocketSummary[]> => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "rockets",
      draft: false,
      limit: 2,
      sort: "-launchedAt",
    });

    return result.docs.map((doc) =>
      mapRocket(doc as PayloadDoc<PayloadRocket>),
    );
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

    return result.docs.map((doc) =>
      mapRocket(doc as PayloadDoc<PayloadRocket>),
    );
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

    const docs = result.docs.map((doc) =>
      mapEvent(doc as PayloadDoc<PayloadEvent>),
    );
    const now = new Date();

    const upcoming = docs
      .filter((event) => !event.isPast && new Date(event.date) >= now)
      .sort((a, b) => a.date.localeCompare(b.date));

    const past = docs
      .filter((event) => event.isPast || new Date(event.date) < now)
      .sort((a, b) => b.date.localeCompare(a.date));

    return { upcoming, past };
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
        mapFeature(doc as PayloadDoc<PayloadFeature>),
      ),
      journey: journeyResult.docs.map((doc) =>
        mapFeature(doc as PayloadDoc<PayloadFeature>),
      ),
      teamStructure: teamResult.docs.map((doc) =>
        mapTeamRole(doc as PayloadDoc<PayloadTeamRole>),
      ),
      stats: statsResult.docs.map((doc) =>
        mapStat(doc as PayloadDoc<PayloadStat>),
      ),
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
      .map((doc) => (doc as PayloadDoc<PayloadExecutive>).year)
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

  const cachedLoader = unstable_cache(
    async (): Promise<Exec[]> => {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "executives",
        draft: false,
        pagination: false,
        sort: "order",
        where: {
          year: {
            equals: targetYear,
          },
        },
      });

      return result.docs.map((doc) =>
        mapExec(doc as PayloadDoc<PayloadExecutive>),
      );
    },
    ["exec-team", String(targetYear)],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: ["about", "exec", `exec-year:${targetYear}`],
    },
  );

  return cachedLoader();
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

    return result.docs.map((doc) =>
      mapSponsor(doc as PayloadDoc<PayloadSponsor>),
    );
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
    };
  },
  ["site-settings"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["settings"] },
);

export async function getRocketBySlug(
  slug: string,
): Promise<RocketDetail | null> {
  const cachedLoader = unstable_cache(
    async (): Promise<RocketDetail | null> => {
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
      return doc ? mapRocket(doc as PayloadDoc<PayloadRocket>) : null;
    },
    ["rocket-by-slug", slug],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: ["rockets", `rocket:${slug}`],
    },
  );

  return cachedLoader();
}

export async function getEventBySlug(
  slug: string,
): Promise<EventDetail | null> {
  const cachedLoader = unstable_cache(
    async (): Promise<EventDetail | null> => {
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
      return doc ? mapEvent(doc as PayloadDoc<PayloadEvent>) : null;
    },
    ["event-by-slug", slug],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: ["events", `event:${slug}`],
    },
  );

  return cachedLoader();
}
