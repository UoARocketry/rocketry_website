import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "prefix" varchar;
    UPDATE "media" SET "prefix" = 'media' WHERE "prefix" IS NULL;
    ALTER TABLE "media" ALTER COLUMN "prefix" SET DEFAULT 'media';

    DROP INDEX IF EXISTS "media_filename_idx";
    CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_prefix_idx" ON "media" USING btree ("filename", "prefix");
    CREATE INDEX IF NOT EXISTS "media_prefix_idx" ON "media" USING btree ("prefix");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_prefix_idx";
    DROP INDEX IF EXISTS "media_filename_prefix_idx";
    CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");

    ALTER TABLE "media" ALTER COLUMN "prefix" DROP DEFAULT;
    ALTER TABLE "media" DROP COLUMN IF EXISTS "prefix";
  `);
}
