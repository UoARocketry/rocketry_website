import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "events_sessions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "date" timestamp(3) with time zone,
      "description" varchar,
      "location" varchar
    );
    CREATE TABLE "_events_v_version_sessions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "date" timestamp(3) with time zone,
      "description" varchar,
      "location" varchar,
      "_uuid" varchar
    );

    ALTER TABLE "events_sessions" ADD CONSTRAINT "events_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_events_v_version_sessions" ADD CONSTRAINT "_events_v_version_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "events_sessions_order_idx" ON "events_sessions" USING btree ("_order");
    CREATE INDEX "events_sessions_parent_id_idx" ON "events_sessions" USING btree ("_parent_id");
    CREATE INDEX "_events_v_version_sessions_order_idx" ON "_events_v_version_sessions" USING btree ("_order");
    CREATE INDEX "_events_v_version_sessions_parent_id_idx" ON "_events_v_version_sessions" USING btree ("_parent_id");

    ALTER TABLE "events_sessions" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "_events_v_version_sessions" ENABLE ROW LEVEL SECURITY;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "events_sessions" CASCADE;
    DROP TABLE "_events_v_version_sessions" CASCADE;
  `);
}
