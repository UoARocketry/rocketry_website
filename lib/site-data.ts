import { unstable_cache } from "next/cache";
import supabase from "@/lib/supabase";

const CONTENT_REVALIDATE_SECONDS = 300;

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

export const getRocketSummaries = unstable_cache(
  async (): Promise<RocketSummary[]> => {
    const { data, error } = await supabase
      .from("Rocket")
      .select("id,name,slug,image,description,launchedAt")
      .order("launchedAt", { ascending: false })
      .limit(2);

    if (error) throw error;

    return (data ?? []) as RocketSummary[];
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
        .select(
          "id,title,slug,description,date,eventTag,signupUrl,isPast,location",
        )
        .eq("isPast", false)
        .gte("date", nowIso)
        .order("date", { ascending: true })
        .limit(10),
      supabase
        .from("Event")
        .select(
          "id,title,slug,description,date,eventTag,signupUrl,isPast,location",
        )
        .or(pastFilter)
        .order("date", { ascending: false })
        .limit(10),
    ]);

    if (upcomingResult.error) throw upcomingResult.error;
    if (pastResult.error) throw pastResult.error;

    return {
      upcoming: (upcomingResult.data ?? []) as EventSummary[],
      past: (pastResult.data ?? []) as EventSummary[],
    };
  },
  ["events-overview"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["events"] },
);

export const getAboutPayload = unstable_cache(
  async (): Promise<AboutPayload> => {
    const [
      executivesResult,
      whatWeDoResult,
      journeyResult,
      teamResult,
      statsResult,
    ] = await Promise.all([
      supabase.from("Exec").select("*").order("order", { ascending: true }),
      supabase.from("WhatWeDo").select("*").order("id", { ascending: true }),
      supabase.from("JourneyItem").select("*").order("id", { ascending: true }),
      supabase.from("TeamRole").select("*").order("id", { ascending: true }),
      supabase.from("Stat").select("*").order("id", { ascending: true }),
    ]);

    if (executivesResult.error) throw executivesResult.error;
    if (whatWeDoResult.error) throw whatWeDoResult.error;
    if (journeyResult.error) throw journeyResult.error;
    if (teamResult.error) throw teamResult.error;
    if (statsResult.error) throw statsResult.error;

    return {
      executives: (executivesResult.data ?? []) as Exec[],
      whatWeDo: (whatWeDoResult.data ?? []) as Feature[],
      journey: (journeyResult.data ?? []) as Feature[],
      teamStructure: (teamResult.data ?? []) as TeamRole[],
      stats: (statsResult.data ?? []) as Stat[],
    };
  },
  ["about-payload"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["about"] },
);

export const getExecTeam = unstable_cache(
  async (): Promise<Exec[]> => {
    const { data, error } = await supabase
      .from("Exec")
      .select("*")
      .order("order", { ascending: true });

    if (error) throw error;

    return (data ?? []) as Exec[];
  },
  ["exec-team"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["about", "exec"] },
);

export const getSponsors = unstable_cache(
  async (): Promise<Sponsor[]> => {
    const { data, error } = await supabase
      .from("Sponsor")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    return (data ?? []) as Sponsor[];
  },
  ["sponsors"],
  { revalidate: CONTENT_REVALIDATE_SECONDS, tags: ["sponsors"] },
);

export async function getRocketBySlug(
  slug: string,
): Promise<RocketDetail | null> {
  const cachedLoader = unstable_cache(
    async (): Promise<RocketDetail | null> => {
      const { data, error } = await supabase
        .from("Rocket")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;

      return (data ?? null) as RocketDetail | null;
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
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;

      return (data ?? null) as EventDetail | null;
    },
    ["event-by-slug", slug],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: ["events", `event:${slug}`],
    },
  );

  return cachedLoader();
}
