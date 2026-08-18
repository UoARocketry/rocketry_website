import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "events" DROP COLUMN IF EXISTS "is_past";
    ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_is_past";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "is_past" boolean DEFAULT false;
    ALTER TABLE "_events_v" ADD COLUMN IF NOT EXISTS "version_is_past" boolean DEFAULT false;
  `);
}
