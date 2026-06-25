import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import {
  buildAllowedOrigins,
  resolveDatabaseUrl,
  resolvePayloadSecret,
  resolveServerUrl,
} from "@/lib/env";
import { Events } from "./payload/collections/Events.ts";
import { Executives } from "./payload/collections/Executives.ts";
import { JourneyItems } from "./payload/collections/JourneyItems.ts";
import { Media } from "./payload/collections/Media.ts";
import { Rockets } from "./payload/collections/Rockets.ts";
import { Sponsors } from "./payload/collections/Sponsors.ts";
import { Stats } from "./payload/collections/Stats.ts";
import { TeamRoles } from "./payload/collections/TeamRoles.ts";
import { Users } from "./payload/collections/Users.ts";
import { WhatWeDo } from "./payload/collections/WhatWeDo.ts";
import { SiteSettings } from "./payload/globals/SiteSettings.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUrl = resolveDatabaseUrl();
const payloadSecret = resolvePayloadSecret();
const allowedOrigins = buildAllowedOrigins();
const serverUrl = resolveServerUrl();
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "";
const supabaseS3Endpoint = process.env.SUPABASE_STORAGE_S3_ENDPOINT || "";
const supabaseS3Region = process.env.SUPABASE_STORAGE_S3_REGION || "us-east-1";
const supabaseS3AccessKey = process.env.SUPABASE_STORAGE_S3_ACCESS_KEY_ID || "";
const supabaseS3Secret =
  process.env.SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY || "";
const supabasePublicUrl = process.env.SUPABASE_STORAGE_PUBLIC_URL || "";

function hasRequiredValues(values: string[]): boolean {
  return values.every((value) => value.trim().length > 0);
}

function normalizePathPart(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/^\/+|\/+$/g, "");
  return normalized.length > 0 ? normalized : undefined;
}

function buildPublicMediaUrl(
  baseUrl: string,
  filename: string,
  prefix?: string,
): string {
  const normalizedPrefix = normalizePathPart(prefix);

  return normalizedPrefix
    ? `${baseUrl}/${normalizedPrefix}/${filename}`
    : `${baseUrl}/${filename}`;
}

const normalizedSupabasePublicUrl = supabasePublicUrl.replace(/\/+$/, "");

const hasSupabaseStorageConfig = [
  supabaseBucket,
  supabaseS3Endpoint,
  supabaseS3AccessKey,
  supabaseS3Secret,
  supabasePublicUrl,
];

const isSupabaseStorageConfigured = hasRequiredValues(hasSupabaseStorageConfig);

const supabaseStoragePlugins = isSupabaseStorageConfigured
  ? [
      s3Storage({
        collections: {
          media: {
            prefix: "media",
            generateFileURL: ({
              filename,
              prefix,
            }: {
              filename: string;
              prefix?: string;
            }) =>
              buildPublicMediaUrl(
                normalizedSupabasePublicUrl,
                filename,
                prefix,
              ),
          },
        },
        bucket: supabaseBucket,
        config: {
          endpoint: supabaseS3Endpoint,
          region: supabaseS3Region,
          credentials: {
            accessKeyId: supabaseS3AccessKey,
            secretAccessKey: supabaseS3Secret,
          },
          forcePathStyle: true,
        },
      }),
    ]
  : [];

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
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
  serverURL: serverUrl,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  secret: payloadSecret,
  db: postgresAdapter({
    push: false,
    pool: {
      connectionString: databaseUrl,
    },
  }),
  plugins: supabaseStoragePlugins,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
