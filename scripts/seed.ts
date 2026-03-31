import "dotenv/config";
import { Client } from "pg";
import supabase from "../lib/supabase";

type Row = Record<string, unknown>;
type MaybeError = { message: string } | null;
type ExistingRow = { id: number } | null;
type EventCleanupRow = { id: number | null; slug: string | null };

type DynamicTableClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        key: string,
        value: unknown,
      ) => {
        maybeSingle: () => Promise<{ data: ExistingRow; error: MaybeError }>;
      };
    };
    update: (item: Row) => {
      eq: (key: string, value: unknown) => Promise<{ error: MaybeError }>;
    };
    insert: (item: Row) => Promise<{ error: MaybeError }>;
  };
};

const db = supabase as unknown as DynamicTableClient;

function isEventCleanupRow(value: unknown): value is EventCleanupRow {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as { id?: unknown; slug?: unknown };
  const idValid = typeof candidate.id === "number" || candidate.id === null;
  const slugValid =
    typeof candidate.slug === "string" || candidate.slug === null;

  return idValid && slugValid;
}

const directUrl = process.env.DIRECT_URL;
const storageBase = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;

function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildStorageImageUrl(path: string): string {
  if (!storageBase) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_STORAGE_URL is missing in environment",
    );
  }

  return `${storageBase.replace(/\/$/, "")}/${encodePath(path)}`;
}

async function syncAboutImageColumns() {
  if (!directUrl) {
    throw new Error("DIRECT_URL is missing in environment");
  }

  const sql = `
alter table public."WhatWeDo"
  add column if not exists "image" text;

alter table public."JourneyItem"
  add column if not exists "image" text;

alter table public."WhatWeDo"
  drop column if exists "icon";

alter table public."JourneyItem"
  drop column if exists "icon";
`;

  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

async function syncEventAndExecColumns() {
  if (!directUrl) {
    throw new Error("DIRECT_URL is missing in environment");
  }

  const sql = `
alter table public."Event"
  add column if not exists "image" text;

alter table public."Exec"
  add column if not exists "linkedinUrl" text;

alter table public."Exec"
  add column if not exists "year" integer;

update public."Exec"
set "year" = extract(year from now())::int
where "year" is null;

alter table public."Exec"
  alter column "year" set default extract(year from now())::int;

alter table public."Exec"
  alter column "year" set not null;

create index if not exists "Exec_year_idx"
  on public."Exec" ("year");
`;

  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

type AboutTable = "WhatWeDo" | "JourneyItem";

async function upsertAboutByTitle(
  table: AboutTable,
  item: {
    title: string;
    body: string;
    variant: "background" | "surface";
    image: string;
  },
) {
  if (!directUrl) {
    throw new Error("DIRECT_URL is missing in environment");
  }

  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const updateResult = await client.query(
      `
update public."${table}"
set "body" = $1,
    "variant" = $2,
    "image" = $3
where "title" = $4
`,
      [item.body, item.variant, item.image, item.title],
    );

    if (updateResult.rowCount && updateResult.rowCount > 0) {
      return "updated";
    }

    await client.query(
      `
insert into public."${table}" ("title", "body", "variant", "image")
values ($1, $2, $3, $4)
`,
      [item.title, item.body, item.variant, item.image],
    );

    return "created";
  } finally {
    await client.end();
  }
}

async function upsertExecByName(item: {
  name: string;
  role: string;
  bio: string;
  photo: string;
  order: number;
  year: number;
  linkedinUrl: string;
}) {
  if (!directUrl) {
    throw new Error("DIRECT_URL is missing in environment");
  }

  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const updateResult = await client.query(
      `
update public."Exec"
set "role" = $1,
    "bio" = $2,
    "photo" = $3,
    "order" = $4,
    "linkedinUrl" = $5,
    "year" = $6
where "name" = $7
`,
      [
        item.role,
        item.bio,
        item.photo,
        item.order,
        item.linkedinUrl,
        item.year,
        item.name,
      ],
    );

    if (updateResult.rowCount && updateResult.rowCount > 0) {
      return "updated";
    }

    await client.query(
      `
insert into public."Exec" ("name", "role", "bio", "photo", "order", "linkedinUrl", "year")
values ($1, $2, $3, $4, $5, $6, $7)
`,
      [
        item.name,
        item.role,
        item.bio,
        item.photo,
        item.order,
        item.linkedinUrl,
        item.year,
      ],
    );

    return "created";
  } finally {
    await client.end();
  }
}

async function upsertEventBySlug(item: {
  title: string;
  slug: string;
  image: string;
  description: string;
  date: string;
  location: string;
  eventTag: string;
  isPast: boolean;
  signupUrl: string | null;
}) {
  if (!directUrl) {
    throw new Error("DIRECT_URL is missing in environment");
  }

  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const updateResult = await client.query(
      `
update public."Event"
set "title" = $1,
    "image" = $2,
    "description" = $3,
    "date" = $4,
    "location" = $5,
    "eventTag" = $6,
    "isPast" = $7,
    "signupUrl" = $8
where "slug" = $9
`,
      [
        item.title,
        item.image,
        item.description,
        item.date,
        item.location,
        item.eventTag,
        item.isPast,
        item.signupUrl,
        item.slug,
      ],
    );

    if (updateResult.rowCount && updateResult.rowCount > 0) {
      return "updated";
    }

    await client.query(
      `
insert into public."Event" ("title", "slug", "image", "description", "date", "location", "eventTag", "isPast", "signupUrl")
values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`,
      [
        item.title,
        item.slug,
        item.image,
        item.description,
        item.date,
        item.location,
        item.eventTag,
        item.isPast,
        item.signupUrl,
      ],
    );

    return "created";
  } finally {
    await client.end();
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length];
}

function daysFromNow(days: number): Date {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + days);
  return now;
}

async function upsertByUnique(table: string, uniqueKey: string, item: Row) {
  const { data: existing, error: selectError } = await db
    .from(table)
    .select("id")
    .eq(uniqueKey, item[uniqueKey])
    .maybeSingle();

  if (selectError) {
    throw new Error(
      `Failed reading ${table} by ${uniqueKey}=${String(item[uniqueKey])}: ${selectError.message}`,
    );
  }

  if (existing?.id) {
    const { error: updateError } = await db
      .from(table)
      .update(item)
      .eq("id", existing.id);
    if (updateError) {
      throw new Error(
        `Failed updating ${table} (${String(existing.id)}): ${updateError.message}`,
      );
    }
    return "updated";
  }

  const { error: insertError } = await db.from(table).insert(item);
  if (insertError) {
    throw new Error(
      `Failed inserting into ${table} by ${uniqueKey}=${String(item[uniqueKey])}: ${insertError.message}`,
    );
  }
  return "created";
}

function generateExecData(year: number, count: number, nameOffset: number) {
  const firstNames = [
    "Avery",
    "Jordan",
    "Casey",
    "Taylor",
    "Riley",
    "Morgan",
    "Skyler",
    "Quinn",
    "Harper",
    "Jamie",
    "Rowan",
    "Parker",
    "Logan",
    "Dakota",
    "Elliot",
    "Reese",
    "Finley",
    "Sage",
    "Emerson",
    "Sawyer",
  ];
  const lastNames = [
    "Nguyen",
    "Patel",
    "Williams",
    "Chen",
    "Singh",
    "Kim",
    "Thompson",
    "Wilson",
    "Sharma",
    "Lee",
    "Martin",
    "Davis",
    "Brown",
    "Clark",
    "Walker",
    "Wright",
    "Hall",
    "Allen",
    "Young",
    "Scott",
  ];
  const roles = [
    "President",
    "Vice President",
    "Chief Engineer",
    "Avionics Lead",
    "Structures Lead",
    "Propulsion Lead",
    "Ground Operations Lead",
    "Recovery Lead",
    "Sponsorship Lead",
  ];
  const focusAreas = [
    "systems integration",
    "high-power rocketry",
    "team coordination",
    "flight readiness",
    "design reviews",
    "launch operations",
    "safety procedures",
    "mentoring new members",
  ];

  return Array.from({ length: count }, (_, i) => {
    const nameIndex = nameOffset + i;
    const name = `${firstNames[nameIndex]} ${lastNames[nameIndex]}`;
    const role = pick(roles, i);
    const focus = pick(focusAreas, i * 2 + 1);

    return {
      name,
      role,
      bio: `${name} leads ${focus} and helps the team execute reliable missions from concept to launch day.`,
      photo: `https://picsum.photos/seed/exec-${slugify(name)}/320/320`,
      order: i + 1,
      year,
      linkedinUrl: `https://www.linkedin.com/in/${slugify(name)}`,
    };
  });
}

function generateSponsorData(count: number) {
  const prefixes = [
    "Orbital",
    "Vector",
    "Apex",
    "Nimbus",
    "Zenith",
    "Pioneer",
    "Frontier",
    "Strato",
    "Nova",
    "Altitude",
  ];
  const suffixes = [
    "Dynamics",
    "Systems",
    "Labs",
    "Aerospace",
    "Technologies",
    "Manufacturing",
    "Instruments",
    "Composites",
    "Engineering",
    "Works",
  ];
  const tiers = ["GOLD", "SILVER", "BRONZE"];
  const supportFocus = [
    "propulsion testing support",
    "composite fabrication mentorship",
    "instrumentation and telemetry equipment",
    "manufacturing resources for prototypes",
    "ground support infrastructure",
    "student engineering grants",
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = `${pick(prefixes, i)} ${pick(suffixes, i * 2 + 3)}`;
    const safeName = encodeURIComponent(name);

    return {
      name,
      logo: `https://dummyimage.com/320x140/ffffff/111111&text=${safeName}`,
      url: `https://${slugify(name)}.example.com`,
      description: `Supports UARC with ${pick(supportFocus, i)}.`,
      tier: pick(tiers, i),
    };
  });
}

function generateRocketData(count: number) {
  const namePrefixes = [
    "Kea",
    "Tui",
    "Korimako",
    "Ruru",
    "Aoraki",
    "Kestrel",
    "Aquila",
    "Falcon",
    "Striker",
    "Zenith",
  ];
  const classes = ["I", "II", "III", "IV", "V", "X"];
  const descriptors = [
    "A student-built high-altitude vehicle focused on stable ascent and reliable recovery.",
    "Designed for rapid iteration with modular avionics and adaptable payload bays.",
    "Optimised for structural efficiency with lightweight composite airframe sections.",
    "A research platform for guidance, telemetry, and thrust profiling experiments.",
    "Built to validate manufacturing workflows and improve launch turnaround time.",
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = `${pick(namePrefixes, i)} ${pick(classes, i * 2 + 1)}`;
    const launchedAt =
      i < Math.ceil(count * 0.7) ? daysFromNow(-(60 + i * 35)) : null;

    return {
      name,
      slug: slugify(name),
      description: pick(descriptors, i),
      image: `https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80&seed=rocket-${i}`,
      launchedAt: launchedAt ? launchedAt.toISOString() : null,
    };
  });
}

function generateEventData() {
  return [
    {
      title: "UARC Launch Night 2025",
      slug: "uarc-launch-night-2025",
      description:
        "We are thrilled to invite members to Launch Night, the official kickoff to an exciting year of rocketry at UoA. This is your chance to learn more about the club, meet the exec team, and hear about all the projects, workshops, and launches planned for 2025. Whether you are already a rocketry enthusiast or just curious, this is the perfect event to get involved. Food is provided.",
      date: "2025-03-26T18:30:00+13:00",
      location: "Room 401-418, Engineering Building",
      eventTag: "General",
      isPast: true,
      signupUrl:
        "https://docs.google.com/forms/d/e/1FAIpQLSd440Xqe9W9kJg9uz_wCxYllLlovrPLmzTWFY-GVTEhQ0PTEA/viewform?usp=header",
    },
    {
      title: "Rocket Lab Talk",
      slug: "rocket-lab-talk-2025",
      description:
        "The UoA Rocketry Club is excited to bring members our Rocket Lab Talk. Join other rocketry enthusiasts and enjoy a presentation from speakers at Rocket Lab. Members were invited to help decide what topics would be covered. This is a member-exclusive event with limited capacity due to room booking and catering.",
      date: "2025-04-28T18:00:00+12:00",
      location: "Room 401-401, Engineering Building",
      eventTag: "Industry Talk",
      isPast: true,
      signupUrl: "https://events.humanitix.com/rocket-lab-talk",
    },
    {
      title: "Project Direction Club Meeting",
      slug: "project-direction-club-meeting-2025",
      description:
        "Club meeting focused on the big projects currently in progress, including Level 2/3 builds, altitude builds, hybrid motor development, and more. Members were encouraged to come along if they were keen to get involved or simply curious about what the teams were working on.",
      date: "2025-05-01T18:00:00+12:00",
      location: "Zoom",
      eventTag: "General",
      isPast: true,
      signupUrl:
        "https://zoom.us/j/99328652608?pwd=SanSSNbP4ERnZLsS7G2PkQvb5sXJFs.1",
    },
    {
      title: "Level 1 Build Workshop: OpenRocket Session",
      slug: "l1-build-workshop-openrocket-2025",
      description:
        "First Level 1 lab session for confirmed participants. The workshop covers essential admin and group info, then moves into OpenRocket simulation. Members learn how to check stability, centre of gravity, and centre of pressure, all before launch-focused build work begins.",
      date: "2025-05-23T16:00:00+12:00",
      location: "Engineering Building",
      eventTag: "L1 Build",
      isPast: true,
      signupUrl: null,
    },
    {
      title: "Report Workshop",
      slug: "report-workshop-july-2025",
      description:
        "Report workshop session focused on checking off reports and sharing general announcements. This followed report submission deadlines and gave members a dedicated block of time to finalise simulation/report requirements and align on the next build stages.",
      date: "2025-07-25T16:00:00+12:00",
      location: "Rooms 405-326 / 405-328",
      eventTag: "L1 Build",
      isPast: true,
      signupUrl: null,
    },
    {
      title: "Makerspace Sewing Inductions",
      slug: "makerspace-sewing-inductions-2025",
      description:
        "Build workshops to begin parachute construction, including sewing machine induction and a general guide for sewing chutes. Due to space limits, teams nominated attendees per group and completed health and safety quizzes beforehand. Workshop attendance covered induction and setup, with chute completion continuing in members' own time.",
      date: "2025-07-29T09:00:00+12:00",
      location: "Makers Space, Engineering Building",
      eventTag: "L1 Build",
      isPast: true,
      signupUrl:
        "https://events.humanitix.com/makerspace-sewing-inductions-scaa6qbx",
    },
    {
      title: "Matariki Launchpad: Pathways into Aerospace",
      slug: "matariki-launchpad-pathways-into-aerospace-2025",
      description:
        "Aerospace Auckland's Matariki Launchpad event for students and early-career professionals interested in internships and careers in Aotearoa's growing aerospace sector. The evening included talks from industry leaders on aerospace pathways and entry-level opportunities, plus student and professional networking over light kai.",
      date: "2025-07-31T17:30:00+12:00",
      location: "GridAKL, Wynyard Quarter",
      eventTag: "Industry Talk",
      isPast: true,
      signupUrl:
        "https://www.eventbrite.com/e/matariki-launchpad-pathways-into-aerospace-tickets-1479104604689?aff=ebdssbdestsearch",
    },
    {
      title: "L1 Laser Cutting Workshop",
      slug: "l1-laser-cutting-workshop-2025",
      description:
        "Second build workshop focused on making fins by laser cutting. Teams nominated attendees for limited-capacity sessions and were required to have files prepared before attending. Booking instructions and preparation guidance were provided ahead of workshop dates.",
      date: "2025-08-15T11:00:00+12:00",
      location: "405-221 MDLS Laser Cutter",
      eventTag: "L1 Build",
      isPast: true,
      signupUrl: "https://events.humanitix.com/l1-laser-cutting-build-workshop",
    },
    {
      title: "L1 3D Printing Workshop",
      slug: "l1-3d-printing-workshop-2025",
      description:
        "Third build workshop focused on making nose cones with 3D printing. Teams nominated attendees for limited sessions and converted CAD files to STL before attending. Members were told nose cone shoulders would be provided separately and only the required parts needed printing.",
      date: "2025-08-27T14:00:00+12:00",
      location: "405-347 MDLS 3D Printers",
      eventTag: "L1 Build",
      isPast: true,
      signupUrl: "https://events.humanitix.com/l1-3d-printing-build-workshop",
    },
    {
      title: "Final Build Workshop: Epoxy & Assembly",
      slug: "final-build-workshop-epoxy-assembly-2025",
      description:
        "Final build workshop for epoxy and assembly in MDLS Wet & Clean labs with provided PPE and proper ventilation. Teams were required to have all 3D printed and laser-cut parts completed before attending. If required parts were not ready, teams could not assemble and therefore could not proceed to launch readiness.",
      date: "2025-09-19T11:00:00+12:00",
      location: "405-122 MDLS Wet & Clean Lab",
      eventTag: "L1 Build",
      isPast: true,
      signupUrl: "https://events.humanitix.com/l1-epoxy-and-assembly-workshop",
    },
    {
      title: "UARC AGM 2025",
      slug: "uarc-agm-2025",
      description:
        "Annual General Meeting including the Presidents' address, Treasurer's financial report, and voting for the club's next president. Members were reminded that each member has one vote and invited to apply for leadership roles through the provided application form.",
      date: "2025-10-01T17:30:00+13:00",
      location: "401-401, Engineering Building",
      eventTag: "General",
      isPast: true,
      signupUrl:
        "https://docs.google.com/forms/d/e/1FAIpQLSdhpRiGsY2gbCmXrp3lDM67_IzZ79xqhQ8chJqgkp7TFx6eIA/viewform?usp=header",
    },
    {
      title: "FSAE x UAC x UARC Pub Quiz",
      slug: "fsae-uac-uarc-pub-quiz-2025",
      description:
        "Cross-club pub quiz with FSAE, UAC, and UARC featuring rockets, cars, and planes. Entry was free for eligible club members with a drinks tab included, and prizes were provided by sponsors. Members were encouraged to sign up with friends and compete for bragging rights.",
      date: "2025-10-03T18:30:00+13:00",
      location: "Shadows",
      eventTag: "Social",
      isPast: true,
      signupUrl:
        "https://events.humanitix.com/fsae-x-uac-x-uarc-pub-quiz?fbclid=PAVERFWAM-11RleHRuA2FlbQIxMAABpwHF00gEFVKRtJ3Z999ZpPH8TJB0j2BJLSC-eo2HjaKaG3-Ii2Ku-qHq2P3e_aem_Ip-oEqe7T4BMc15DclxSyw",
    },
    {
      title: "Rocket Motor Talk with Dr Malcolm Snowdon",
      slug: "rocket-motor-talk-dr-malcolm-snowdon-2025",
      description:
        "Open talk hosted with UoA Aeronautics Club and the Royal Aeronautical Society, featuring Dr Malcolm Snowdon from Snowdon Consulting Ltd. The session covered rocket motors and broader aerospace consulting work including launch vehicle development, orbital analysis, feasibility studies, and hardware prototyping. No sign-up or membership requirement was needed.",
      date: "2025-10-20T12:00:00+13:00",
      location: "401-401",
      eventTag: "Industry Talk",
      isPast: true,
      signupUrl: null,
    },
    {
      title: "UARC Launch Night 2026",
      slug: "uarc-launch-night-2026",
      description:
        "Launch Night to kick off the year, where members can learn about the club, meet the exec team, and hear about projects, workshops, and launches planned ahead. The event also outlined ways to get involved in build pathways as preparations progress toward AURC 2026. Food was provided and members were invited to RSVP.",
      date: "2026-03-13T18:30:00+13:00",
      location: "Room 405-460, Engineering Building",
      eventTag: "General",
      isPast: false,
      signupUrl: "https://forms.gle/1nGVSzsKXdXCBYLk9",
    },
  ].map((event) => ({
    ...event,
    image: buildStorageImageUrl(`images/events/${event.slug}.jpg`),
  }));
}

async function syncSiteSettingsTable() {
  if (!directUrl) {
    throw new Error("DIRECT_URL is missing in environment");
  }

  const defaultExecTeamImageUrl = buildStorageImageUrl(
    "images/execs/exec_team.jpg",
  );

  const sql = `
create table if not exists public."SiteSettings" (
  id int primary key default 1,
  "memberJoinUrl" text,
  "execTeamImageUrl" text,
  updated_at timestamp default now()
);

alter table public."SiteSettings"
  add column if not exists "execTeamImageUrl" text;

insert into public."SiteSettings" (id, "execTeamImageUrl")
values (1, '${defaultExecTeamImageUrl}')
on conflict (id) do update set "execTeamImageUrl" = coalesce(public."SiteSettings"."execTeamImageUrl", excluded."execTeamImageUrl");
`;

  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

async function main() {
  console.log("📝 Starting Supabase seed with dynamic mock data...");

  try {
    console.log("🛠️ Syncing SiteSettings table...");
    await syncSiteSettingsTable();
    console.log("✅ SiteSettings table sync complete.");

    console.log("🛠️ Syncing WhatWeDo/JourneyItem columns (icon -> image)...");
    await syncAboutImageColumns();
    console.log("✅ About section schema sync complete.");

    console.log("🛠️ Syncing Event/Exec columns (image + linkedinUrl)...");
    await syncEventAndExecColumns();
    console.log("✅ Event and Exec schema sync complete.");

    console.log("📚 Seeding About page content (fixed copy)...");

    const whatWeDo: Array<{
      image: string;
      title: string;
      body: string;
      variant: "background" | "surface";
    }> = [
      {
        image: buildStorageImageUrl("images/cards/design-build.jpg"),
        title: "Workshops",
        body: "Hands-on workshops covering rocket design, propulsion systems, and manufacturing techniques. Learn practical skills from experienced members.",
        variant: "background",
      },
      {
        image: buildStorageImageUrl("images/cards/launch-compete.jpg"),
        title: "Industry Events",
        body: "Connect with professionals in the aerospace industry through guest lectures, site visits, and networking events with leading companies.",
        variant: "background",
      },
      {
        image: buildStorageImageUrl("images/cards/learn-grow.jpg"),
        title: "Social Events",
        body: "Build friendships and team spirit through social gatherings, team building activities, and celebrations of our achievements.",
        variant: "background",
      },
    ];

    for (const item of whatWeDo) {
      const action = await upsertAboutByTitle("WhatWeDo", item);
      console.log(
        `${action === "created" ? "✅" : "🔁"} ${action} WhatWeDo: ${item.title}`,
      );
    }

    const journey: Array<{
      image: string;
      title: string;
      body: string;
      variant: "background" | "surface";
    }> = [
      {
        image: buildStorageImageUrl("images/cards/founded.jpg"),
        title: "2024 - Foundation",
        body: "UARC was established by Laura with a vision to bring rocketry to the University of Auckland.",
        variant: "surface",
      },
      {
        image: buildStorageImageUrl("images/cards/first-launch.jpg"),
        title: "2025 - First Launch",
        body: "Successfully launched our first rocket, marking a major milestone in our club's history and proving our engineering capabilities.",
        variant: "surface",
      },
      {
        image: buildStorageImageUrl("images/cards/growing.jpg"),
        title: "2 - Years Active",
        body: "Continuing to push boundaries with advanced rocket designs, expanded team, and growing influence in the aerospace community.",
        variant: "surface",
      },
    ];

    for (const item of journey) {
      const action = await upsertAboutByTitle("JourneyItem", item);
      console.log(
        `${action === "created" ? "✅" : "🔁"} ${action} JourneyItem: ${item.title}`,
      );
    }

    const teamStructure = [
      {
        title: "Ground Station Team",
        body: "Manage launch operations, tracking systems, and communication with rockets during flight.",
        bullets: [
          "Launch coordination",
          "Telemetry tracking",
          "Communication systems",
        ],
        variant: "surface",
      },
      {
        title: "Recovery Team",
        body: "Develop parachute systems and recovery mechanisms to safely return rockets to the ground.",
        bullets: [
          "Parachute design",
          "Deployment mechanisms",
          "Landing zone analysis",
        ],
        variant: "surface",
      },
      {
        title: "Structural Team",
        body: "Design and manufacture rocket airframes, ensuring structural integrity and aerodynamic efficiency.",
        bullets: [
          "Airframe design",
          "Material selection",
          "Manufacturing processes",
        ],
        variant: "surface",
      },
      {
        title: "Avionics Team",
        body: "Handle all electronic systems including flight computers, sensors, and communication systems.",
        bullets: [
          "Flight computer programming",
          "Sensor integration",
          "Telemetry systems",
        ],
        variant: "surface",
      },
      {
        title: "Control Systems Team",
        body: "Design and implement guidance, navigation, and control systems for rocket stability and trajectory.",
        bullets: [
          "Guidance algorithms",
          "Navigation systems",
          "Flight control",
        ],
        variant: "surface",
      },
    ];

    for (const item of teamStructure) {
      const action = await upsertByUnique("TeamRole", "title", item);
      console.log(
        `${action === "created" ? "✅" : "🔁"} ${action} TeamRole: ${item.title}`,
      );
    }

    const stats = [
      { value: "4+", label: "Rockets Launched" },
      { value: "50+", label: "Members" },
      { value: "100m+", label: "Maximum Altitude" },
      { value: "0+", label: "Competitions" },
    ];
    for (const item of stats) {
      const action = await upsertByUnique("Stat", "label", item);
      console.log(
        `${action === "created" ? "✅" : "🔁"} ${action} Stat: ${item.label}`,
      );
    }

    console.log("🧪 Generating dynamic mock data for all other entities...");

    const execSeedYears = [2026, 2025];
    for (const [yearIndex, year] of execSeedYears.entries()) {
      const execItems = generateExecData(year, 9, yearIndex * 9);
      for (const item of execItems) {
        const action = await upsertExecByName(item);
        console.log(
          `${action === "created" ? "✅" : "🔁"} ${action} Exec: ${item.name} (${item.year})`,
        );
      }
    }

    const sponsorItems = generateSponsorData(12);
    for (const item of sponsorItems) {
      const action = await upsertByUnique("Sponsor", "name", item);
      console.log(
        `${action === "created" ? "✅" : "🔁"} ${action} Sponsor: ${item.name}`,
      );
    }

    const rocketItems = generateRocketData(10);
    for (const item of rocketItems) {
      const action = await upsertByUnique("Rocket", "slug", item);
      console.log(
        `${action === "created" ? "✅" : "🔁"} ${action} Rocket: ${item.name}`,
      );
    }

    const eventItems = generateEventData();
    for (const item of eventItems) {
      const action = await upsertEventBySlug(item);
      console.log(
        `${action === "created" ? "✅" : "🔁"} ${action} Event: ${item.title}`,
      );
    }

    const keepSlugs = new Set(eventItems.map((event) => event.slug));
    const { data: existingEvents, error: existingEventsError } = await supabase
      .from("Event")
      .select("*");

    if (existingEventsError) {
      throw new Error(
        `Failed listing existing events for cleanup: ${existingEventsError.message}`,
      );
    }

    const existingEventRows: unknown[] = Array.isArray(existingEvents)
      ? existingEvents
      : [];

    const staleEventIds = existingEventRows
      .filter(isEventCleanupRow)
      .filter(
        (event) => typeof event.slug === "string" && !keepSlugs.has(event.slug),
      )
      .map((event) => event.id)
      .filter((id): id is number => typeof id === "number");

    if (staleEventIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("Event")
        .delete()
        .in("id", staleEventIds);

      if (deleteError) {
        throw new Error(`Failed deleting stale events: ${deleteError.message}`);
      }

      console.log(`🧹 deleted ${staleEventIds.length} stale Event rows.`);
    } else {
      console.log("🧹 no stale Event rows found.");
    }

    console.log("🎉 Seeding completed successfully.");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
}

main().catch((e) => {
  console.error("💥 Seeding failed:", e);
  process.exit(1);
});
