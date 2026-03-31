import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import { Events } from "./payload/collections/Events.ts";
import { Executives } from "./payload/collections/Executives.ts";
import { JourneyItems } from "./payload/collections/JourneyItems.ts";
import { Rockets } from "./payload/collections/Rockets.ts";
import { Sponsors } from "./payload/collections/Sponsors.ts";
import { Stats } from "./payload/collections/Stats.ts";
import { TeamRoles } from "./payload/collections/TeamRoles.ts";
import { Users } from "./payload/collections/Users.ts";
import { WhatWeDo } from "./payload/collections/WhatWeDo.ts";
import { SiteSettings } from "./payload/globals/SiteSettings.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const payloadSecret =
  process.env.PAYLOAD_SECRET || "dev-only-secret-change-before-production";

if (!databaseUrl) {
  throw new Error(
    "Missing database connection string. Set DIRECT_URL or DATABASE_URL.",
  );
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Events,
    Rockets,
    Executives,
    Sponsors,
    WhatWeDo,
    JourneyItems,
    TeamRoles,
    Stats,
  ],
  globals: [SiteSettings],
  secret: payloadSecret,
  db: postgresAdapter({
    push: false,
    pool: {
      connectionString: databaseUrl,
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
