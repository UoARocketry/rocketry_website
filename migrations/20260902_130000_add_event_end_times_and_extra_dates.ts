import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * End times, and further days for an event that runs across more than one.
 *
 * Until now an event stored a start and nothing else, so "12:00 PM – 3:00 PM
 * on the 3rd and 4th" could only be written into the description. Sessions
 * exist for a workshop series with different content each week; a two-day open
 * day is a different shape and gets `extra_dates` instead.
 *
 * The array tables mirror `events_sessions`, including the RLS that Supabase
 * requires on every table.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "events" ADD COLUMN "end_time" timestamp(3) with time zone;
    ALTER TABLE "_events_v" ADD COLUMN "version_end_time" timestamp(3) with time zone;
    ALTER TABLE "events_sessions" ADD COLUMN "end_time" timestamp(3) with time zone;
    ALTER TABLE "_events_v_version_sessions" ADD COLUMN "end_time" timestamp(3) with time zone;

    CREATE TABLE "events_extra_dates" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "date" timestamp(3) with time zone,
      "start_time" timestamp(3) with time zone,
      "end_time" timestamp(3) with time zone
    );
    CREATE TABLE "_events_v_version_extra_dates" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "date" timestamp(3) with time zone,
      "start_time" timestamp(3) with time zone,
      "end_time" timestamp(3) with time zone,
      "_uuid" varchar
    );

    ALTER TABLE "events_extra_dates" ADD CONSTRAINT "events_extra_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_events_v_version_extra_dates" ADD CONSTRAINT "_events_v_version_extra_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "events_extra_dates_order_idx" ON "events_extra_dates" USING btree ("_order");
    CREATE INDEX "events_extra_dates_parent_id_idx" ON "events_extra_dates" USING btree ("_parent_id");
    CREATE INDEX "_events_v_version_extra_dates_order_idx" ON "_events_v_version_extra_dates" USING btree ("_order");
    CREATE INDEX "_events_v_version_extra_dates_parent_id_idx" ON "_events_v_version_extra_dates" USING btree ("_parent_id");

    ALTER TABLE "events_extra_dates" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "_events_v_version_extra_dates" ENABLE ROW LEVEL SECURITY;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "events_extra_dates" CASCADE;
    DROP TABLE "_events_v_version_extra_dates" CASCADE;

    ALTER TABLE "events" DROP COLUMN IF EXISTS "end_time";
    ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_end_time";
    ALTER TABLE "events_sessions" DROP COLUMN IF EXISTS "end_time";
    ALTER TABLE "_events_v_version_sessions" DROP COLUMN IF EXISTS "end_time";
  `);
}
