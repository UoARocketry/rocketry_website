import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Lets an event name its own signup button.
 *
 * The label was hard-coded to "Sign Up", which is wrong for anything that is
 * not a signup: a ticket sale, an RSVP, a form that closes registrations and
 * opens a waitlist. Left empty the page still says "Sign Up", so existing
 * events are unaffected and no backfill is needed.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "events" ADD COLUMN "signup_label" varchar;
    ALTER TABLE "_events_v" ADD COLUMN "version_signup_label" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "events" DROP COLUMN IF EXISTS "signup_label";
    ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_signup_label";
  `);
}
