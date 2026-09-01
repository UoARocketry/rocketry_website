import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Lets a single session span several days, the same way the event itself can.
 *
 * The first nested array in this schema: an array inside `events.sessions`
 * rather than directly on a collection. The parent key types differ between
 * the two trees and are easy to get wrong — `events_sessions.id` is a varchar,
 * while `_events_v_version_sessions.id` is a serial — so each child table's
 * `_parent_id` matches its own parent rather than sharing one type.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "events_sessions_extra_dates" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "date" timestamp(3) with time zone,
      "start_time" timestamp(3) with time zone,
      "end_time" timestamp(3) with time zone
    );
    CREATE TABLE "_events_v_version_sessions_extra_dates" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "date" timestamp(3) with time zone,
      "start_time" timestamp(3) with time zone,
      "end_time" timestamp(3) with time zone,
      "_uuid" varchar
    );

    ALTER TABLE "events_sessions_extra_dates" ADD CONSTRAINT "events_sessions_extra_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_sessions"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_events_v_version_sessions_extra_dates" ADD CONSTRAINT "_events_v_version_sessions_extra_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_version_sessions"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "events_sessions_extra_dates_order_idx" ON "events_sessions_extra_dates" USING btree ("_order");
    CREATE INDEX "events_sessions_extra_dates_parent_id_idx" ON "events_sessions_extra_dates" USING btree ("_parent_id");
    CREATE INDEX "_events_v_version_sessions_extra_dates_order_idx" ON "_events_v_version_sessions_extra_dates" USING btree ("_order");
    CREATE INDEX "_events_v_version_sessions_extra_dates_parent_id_idx" ON "_events_v_version_sessions_extra_dates" USING btree ("_parent_id");

    ALTER TABLE "events_sessions_extra_dates" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "_events_v_version_sessions_extra_dates" ENABLE ROW LEVEL SECURITY;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "events_sessions_extra_dates" CASCADE;
    DROP TABLE "_events_v_version_sessions_extra_dates" CASCADE;
  `);
}
