export type RocketSummary = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  launchedAt?: string | null;
};

export type RocketDetail = RocketSummary & {
  images: string[];
};

export type EventSummary = {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  date: string;
  eventTag?: string | null;
  signupUrl?: string | null;
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

export type SponsorTier = {
  id: number;
  name: string;
  description?: string | null;
  order: number;
};

export type Sponsor = {
  id: number;
  name: string;
  logo: string;
  url: string;
  description?: string | null;
  tier?: SponsorTier | null;
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
  discordUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
};
