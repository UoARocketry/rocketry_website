import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { getPayload } from "payload";

const configModule = await import(
  new URL("../payload.config.ts", import.meta.url).href
);
const config = configModule.default;

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase env vars for bootstrap.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  global: {
    headers: { "x-client-info": "rocketry_website-payload-bootstrap" },
  },
});

async function upsertByField(payload, collection, field, value, data) {
  const existing = await payload.find({
    collection,
    limit: 1,
    where: {
      [field]: {
        equals: value,
      },
    },
    overrideAccess: true,
  });

  if (existing.docs[0]) {
    await payload.update({
      collection,
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    });
    return "updated";
  }

  await payload.create({
    collection,
    data,
    overrideAccess: true,
  });
  return "created";
}

async function upsertExecutive(payload, data) {
  const existing = await payload.find({
    collection: "executives",
    limit: 1,
    where: {
      and: [{ name: { equals: data.name } }, { year: { equals: data.year } }],
    },
    overrideAccess: true,
  });

  if (existing.docs[0]) {
    await payload.update({
      collection: "executives",
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    });
    return "updated";
  }

  await payload.create({
    collection: "executives",
    data,
    overrideAccess: true,
  });
  return "created";
}

async function ensureAdminUsers(payload) {
  const tempPassword = process.env.PAYLOAD_INITIAL_ADMIN_PASSWORD;

  if (!tempPassword) {
    throw new Error("Missing PAYLOAD_INITIAL_ADMIN_PASSWORD");
  }

  const emails = ["jerryputhikunkim@gmail.com", "uoarocketryclub@gmail.com"];

  for (const email of emails) {
    const existing = await payload.find({
      collection: "users",
      limit: 1,
      where: {
        email: {
          equals: email,
        },
      },
      overrideAccess: true,
    });

    if (existing.docs[0]) {
      console.log(`🔁 admin user exists: ${email}`);
      continue;
    }

    await payload.create({
      collection: "users",
      data: {
        email,
        password: tempPassword,
      },
      overrideAccess: true,
    });

    console.log(`✅ created admin user: ${email}`);
  }
}

async function main() {
  const payload = await getPayload({ config });

  await ensureAdminUsers(payload);

  const [
    eventsResult,
    rocketsResult,
    execResult,
    sponsorResult,
    whatWeDoResult,
    journeyResult,
    teamResult,
    statsResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("Event")
      .select(
        "title,slug,image,description,date,eventTag,signupUrl,isPast,location",
      )
      .order("date", { ascending: false }),
    supabase
      .from("Rocket")
      .select("name,slug,image,description,launchedAt")
      .order("launchedAt", { ascending: false }),
    supabase
      .from("Exec")
      .select("name,role,bio,photo,year,order,linkedinUrl")
      .order("year", { ascending: false })
      .order("order", { ascending: true }),
    supabase
      .from("Sponsor")
      .select("name,logo,url,description,tier")
      .order("id", { ascending: true }),
    supabase
      .from("WhatWeDo")
      .select("title,body,image,variant")
      .order("id", { ascending: true }),
    supabase
      .from("JourneyItem")
      .select("title,body,image,variant")
      .order("id", { ascending: true }),
    supabase
      .from("TeamRole")
      .select("title,body,bullets,variant")
      .order("id", { ascending: true }),
    supabase
      .from("Stat")
      .select("value,label")
      .order("id", { ascending: true }),
    supabase
      .from("SiteSettings")
      .select("memberJoinUrl,execTeamImageUrl")
      .limit(1)
      .maybeSingle(),
  ]);

  if (eventsResult.error) throw eventsResult.error;
  if (rocketsResult.error) throw rocketsResult.error;
  if (execResult.error) throw execResult.error;
  if (sponsorResult.error) throw sponsorResult.error;
  if (whatWeDoResult.error) throw whatWeDoResult.error;
  if (journeyResult.error) throw journeyResult.error;
  if (teamResult.error) throw teamResult.error;
  if (statsResult.error) throw statsResult.error;
  if (settingsResult.error) throw settingsResult.error;

  for (const [index, item] of (eventsResult.data ?? []).entries()) {
    const action = await upsertByField(payload, "events", "slug", item.slug, {
      title: item.title,
      slug: item.slug,
      image: item.image,
      description: item.description ?? "",
      date: item.date,
      eventTag: item.eventTag ?? "General",
      signupUrl: item.signupUrl,
      isPast: Boolean(item.isPast),
      location: item.location ?? "",
      order: index + 1,
      _status: "published",
    });
    console.log(
      `${action === "created" ? "✅" : "🔁"} ${action} event: ${item.slug}`,
    );
  }

  for (const [index, item] of (rocketsResult.data ?? []).entries()) {
    const action = await upsertByField(payload, "rockets", "slug", item.slug, {
      name: item.name,
      slug: item.slug,
      image: item.image,
      description: item.description,
      launchedAt: item.launchedAt,
      order: index + 1,
      _status: "published",
    });
    console.log(
      `${action === "created" ? "✅" : "🔁"} ${action} rocket: ${item.slug}`,
    );
  }

  for (const item of execResult.data ?? []) {
    const action = await upsertExecutive(payload, {
      name: item.name,
      role: item.role,
      bio: item.bio,
      photo: item.photo,
      year: item.year,
      order: item.order,
      linkedinUrl: item.linkedinUrl,
      _status: "published",
    });
    console.log(
      `${action === "created" ? "✅" : "🔁"} ${action} executive: ${item.name} (${item.year})`,
    );
  }

  for (const item of sponsorResult.data ?? []) {
    const action = await upsertByField(payload, "sponsors", "name", item.name, {
      ...item,
      _status: "published",
    });
    console.log(
      `${action === "created" ? "✅" : "🔁"} ${action} sponsor: ${item.name}`,
    );
  }

  for (const [index, item] of (whatWeDoResult.data ?? []).entries()) {
    const action = await upsertByField(
      payload,
      "what-we-do",
      "title",
      item.title,
      {
        ...item,
        order: index + 1,
        _status: "published",
      },
    );
    console.log(
      `${action === "created" ? "✅" : "🔁"} ${action} what-we-do: ${item.title}`,
    );
  }

  for (const [index, item] of (journeyResult.data ?? []).entries()) {
    const action = await upsertByField(
      payload,
      "journey-items",
      "title",
      item.title,
      {
        ...item,
        order: index + 1,
        _status: "published",
      },
    );
    console.log(
      `${action === "created" ? "✅" : "🔁"} ${action} journey-item: ${item.title}`,
    );
  }

  for (const [index, item] of (teamResult.data ?? []).entries()) {
    const action = await upsertByField(
      payload,
      "team-roles",
      "title",
      item.title,
      {
        title: item.title,
        body: item.body,
        bullets: (item.bullets ?? []).map((value) => ({ value })),
        variant: item.variant,
        order: index + 1,
        _status: "published",
      },
    );
    console.log(
      `${action === "created" ? "✅" : "🔁"} ${action} team-role: ${item.title}`,
    );
  }

  for (const [index, item] of (statsResult.data ?? []).entries()) {
    const action = await upsertByField(payload, "stats", "label", item.label, {
      ...item,
      order: index + 1,
      _status: "published",
    });
    console.log(
      `${action === "created" ? "✅" : "🔁"} ${action} stat: ${item.label}`,
    );
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      memberJoinUrl: settingsResult.data?.memberJoinUrl ?? "",
      execTeamImageUrl: settingsResult.data?.execTeamImageUrl ?? null,
      _status: "published",
    },
    overrideAccess: true,
  });

  console.log("✅ Site settings synchronized.");
  console.log("🎉 Payload bootstrap complete.");
}

try {
  await main();
} catch (error) {
  console.error("💥 Payload bootstrap failed:", error);
  process.exit(1);
}
