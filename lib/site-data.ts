import { unstable_cache } from "next/cache";
import supabase from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

const CONTENT_REVALIDATE_SECONDS = 300;
const ROCKET_COLUMNS = "id,name,slug,image,description,launchedAt";
const EVENT_COLUMNS =
  "id,title,slug,image,description,date,eventTag,signupUrl,isPast,location";
const EXEC_COLUMNS = "id,name,role,bio,photo,year,linkedinUrl";
const SPONSOR_COLUMNS = "id,name,logo,url,description,tier";
const WHAT_WE_DO_COLUMNS = "title,body,image,variant";
const JOURNEY_COLUMNS = "title,body,image,variant";
const TEAM_ROLE_COLUMNS = "title,body,bullets,variant";
const STAT_COLUMNS = "value,label";

type EventRow = Database["public"]["Tables"]["Event"]["Row"];
type RocketRow = Database["public"]["Tables"]["Rocket"]["Row"];
type ExecRow = Database["public"]["Tables"]["Exec"]["Row"];
type SponsorRow = Database["public"]["Tables"]["Sponsor"]["Row"];
type WhatWeDoRow = Database["public"]["Tables"]["WhatWeDo"]["Row"];
type JourneyItemRow = Database["public"]["Tables"]["JourneyItem"]["Row"];
type TeamRoleRow = Database["public"]["Tables"]["TeamRole"]["Row"];
type StatRow = Database["public"]["Tables"]["Stat"]["Row"];
type SiteSettingsRow = Database["public"]["Tables"]["SiteSettings"]["Row"];

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

function mapRocket(row: RocketRow): RocketSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image,
    description: row.description,
    launchedAt: row.launchedAt,
  };
}

function mapEvent(row: EventRow): EventSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    image: row.image,
    description: row.description,
    date: row.date,
    eventTag: row.eventTag,
    signupUrl: row.signupUrl,
    isPast: row.isPast,
    location: row.location,
  };
}

function mapExec(row: ExecRow): Exec {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    photo: row.photo,
    year: row.year,
    linkedinUrl: row.linkedinUrl,
  };
}

function mapFeature(row: WhatWeDoRow | JourneyItemRow): Feature {
  return {
    title: row.title,
    body: row.body,
    image: row.image,
    variant: row.variant,
  };
}

function mapTeamRole(row: TeamRoleRow): TeamRole {
  return {
    title: row.title,
    body: row.body,
    bullets: row.bullets ?? undefined,
    variant: row.variant,
  };
}

function mapStat(row: StatRow): Stat {
  return {
    value: row.value,
    label: row.label,
  };
}

function mapSponsor(row: SponsorRow): Sponsor {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo,
    url: row.url,
    description: row.description,
    tier: row.tier,
  };
}

export const getRocketSummaries = unstable_cache(
  async (): Promise<RocketSummary[]> => {
    const { data, error } = await supabase
      .from("Rocket")
      .select(ROCKET_COLUMNS)
      .order("launchedAt", { ascending: false })
      .limit(2);

    if (error) throw error;

    return (data ?? []).map(mapRocket);
  },
  ["rocket-summaries"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["rockets"] },
);

export const getEventsOverview = unstable_cache(
  async (): Promise<EventsOverview> => {
    const nowIso = new Date().toISOString();
    const pastFilter = `isPast.eq.true,date.lt.${nowIso}`;

    const [upcomingResult, pastResult] = await Promise.all([
      supabase
        .from("Event")
        .select(EVENT_COLUMNS)
        .eq("isPast", false)
        .gte("date", nowIso)
        .order("date", { ascending: true })
        .limit(10),
      supabase
        .from("Event")
        .select(EVENT_COLUMNS)
        .or(pastFilter)
        .order("date", { ascending: false })
        .limit(10),
    ]);

    if (upcomingResult.error) throw upcomingResult.error;
    if (pastResult.error) throw pastResult.error;

    return {
      upcoming: (upcomingResult.data ?? []).map(mapEvent),
      past: (pastResult.data ?? []).map(mapEvent),
    };
  },
  ["events-overview"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["events"] },
);

export const getAboutPayload = unstable_cache(
  async (): Promise<AboutPayload> => {
    const [
      execTeamPayload,
      whatWeDoResult,
      journeyResult,
      teamResult,
      statsResult,
    ] = await Promise.all([
      getExecTeamPayload(),
      supabase
        .from("WhatWeDo")
        .select(WHAT_WE_DO_COLUMNS)
        .order("id", { ascending: true }),
      supabase
        .from("JourneyItem")
        .select(JOURNEY_COLUMNS)
        .order("id", { ascending: true }),
      supabase
        .from("TeamRole")
        .select(TEAM_ROLE_COLUMNS)
        .order("id", { ascending: true }),
      supabase
        .from("Stat")
        .select(STAT_COLUMNS)
        .order("id", { ascending: true }),
    ]);

    if (whatWeDoResult.error) throw whatWeDoResult.error;
    if (journeyResult.error) throw journeyResult.error;
    if (teamResult.error) throw teamResult.error;
    if (statsResult.error) throw statsResult.error;

    return {
      executives: execTeamPayload.executives,
      whatWeDo: (whatWeDoResult.data ?? []).map(mapFeature),
      journey: (journeyResult.data ?? []).map(mapFeature),
      teamStructure: (teamResult.data ?? []).map(mapTeamRole),
      stats: (statsResult.data ?? []).map(mapStat),
    };
  },
  ["about-payload"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["about"] },
);

export const getExecYears = unstable_cache(
  async (): Promise<number[]> => {
    const { data, error } = await supabase
      .from("Exec")
      .select(EXEC_COLUMNS)
      .not("year", "is", null)
      .order("year", { ascending: false });

    if (error) throw error;

    const years = (data ?? [])
      .map(mapExec)
      .map((exec) => exec.year)
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
      const { data, error } = await supabase
        .from("Exec")
        .select(EXEC_COLUMNS)
        .eq("year", targetYear)
        .order("order", { ascending: true });

      if (error) throw error;

      return (data ?? []).map(mapExec);
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
    const { data, error } = await supabase
      .from("Sponsor")
      .select(SPONSOR_COLUMNS)
      .order("id", { ascending: true });

    if (error) throw error;

    return (data ?? []).map(mapSponsor);
  },
  ["sponsors"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["sponsors"] },
);

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const { data, error } = await supabase
      .from("SiteSettings")
      .select("memberJoinUrl,execTeamImageUrl")
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const settings: Pick<
      SiteSettingsRow,
      "memberJoinUrl" | "execTeamImageUrl"
    > = data ?? {
      memberJoinUrl: "",
      execTeamImageUrl: null,
    };

    return {
      memberJoinUrl: settings.memberJoinUrl ?? "",
      execTeamImageUrl: settings.execTeamImageUrl ?? null,
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
      const { data, error } = await supabase
        .from("Rocket")
        .select(ROCKET_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;

      return data ? mapRocket(data) : null;
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
      const { data, error } = await supabase
        .from("Event")
        .select(EVENT_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;

      return data ? mapEvent(data) : null;
    },
    ["event-by-slug", slug],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: ["events", `event:${slug}`],
    },
  );

  return cachedLoader();
}
