import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

// NOTE: these are multi-statement blocks, so nothing may be interpolated into
// them — Postgres rejects multiple commands inside a prepared statement, and a
// `${}` in the sql template turns the whole block into one. Inline literals.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rockets" ADD COLUMN "featured" boolean DEFAULT false;
    ALTER TABLE "_rockets_v" ADD COLUMN "version_featured" boolean DEFAULT false;
    CREATE INDEX "rockets_featured_idx" ON "rockets" USING btree ("featured");
    CREATE INDEX "_rockets_v_version_version_featured_idx" ON "_rockets_v" USING btree ("version_featured");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "rockets_featured_idx";
    DROP INDEX IF EXISTS "_rockets_v_version_version_featured_idx";
    ALTER TABLE "rockets" DROP COLUMN IF EXISTS "featured";
    ALTER TABLE "_rockets_v" DROP COLUMN IF EXISTS "version_featured";
  `);
}
