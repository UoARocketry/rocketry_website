import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Lets a single day of a multi-day event or session name its own location.
 *
 * A two-day workshop often moves room between days, which previously could
 * only be written into the description. Left empty, a day inherits the event's
 * or session's location, so nothing changes for the ordinary case.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "events_extra_dates" ADD COLUMN "location" varchar;
    ALTER TABLE "_events_v_version_extra_dates" ADD COLUMN "location" varchar;
    ALTER TABLE "events_sessions_extra_dates" ADD COLUMN "location" varchar;
    ALTER TABLE "_events_v_version_sessions_extra_dates" ADD COLUMN "location" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "events_extra_dates" DROP COLUMN IF EXISTS "location";
    ALTER TABLE "_events_v_version_extra_dates" DROP COLUMN IF EXISTS "location";
    ALTER TABLE "events_sessions_extra_dates" DROP COLUMN IF EXISTS "location";
    ALTER TABLE "_events_v_version_sessions_extra_dates" DROP COLUMN IF EXISTS "location";
  `);
}
