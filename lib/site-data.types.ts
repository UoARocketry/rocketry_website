export type RocketSummary = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  /** Editor-chosen focus and zoom for the card crop. See lib/photo-position. */
  imagePosition?: string | null;
  description?: string | null;
  launchedAt?: string | null;
  /** Editor-controlled: show this rocket in the home page's featured strip. */
  featured: boolean;
  /** Publish state. Only meaningful on the draft-aware preview path. */
  status?: "draft" | "published" | null;
};

/** One row of the CMS-managed Details box on a rocket's page. */
export type RocketSpec = {
  label: string;
  value: string;
};

export type RocketDetail = RocketSummary & {
  images: string[];
  specs: RocketSpec[];
};

export type EventSession = {
  title: string;
  date: string;
  /** Only the clock part is used. Null when the session has no stated finish. */
  endTime?: string | null;
  description?: string | null;
  location?: string | null;
};

/** A further day the same event runs on, with optional hours of its own. */
export type EventExtraDate = {
  date: string;
  startTime?: string | null;
  endTime?: string | null;
};

export type EventSummary = {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  date: string;
  /** Only the clock part is used. Null when the event has no stated finish. */
  endTime?: string | null;
  extraDates: EventExtraDate[];
  eventTag?: string | null;
  /** How people sign up: a link, a sentence, or nothing. */
  signupType: "none" | "link" | "text";
  signupUrl?: string | null;
  signupNote?: string | null;
  location?: string | null;
  sessions: EventSession[];
  /** Publish state. Only meaningful on the draft-aware preview path. */
  status?: "draft" | "published" | null;
};

export type EventDetail = EventSummary;

export type Exec = {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo: string;
  photoPosition?: string | null;
  year: number;
  linkedinUrl?: string | null;
};

export type Feature = {
  image?: string | null;
  /** Editor-chosen focus and zoom for the card crop. See lib/photo-position. */
  imagePosition?: string | null;
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
  contactEmail?: string | null;
};
