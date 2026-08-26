import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

// NOTE: multi-statement blocks, so nothing may be interpolated — Postgres
// rejects multiple commands inside a prepared statement, and a `${}` in the sql
// template turns the whole block into one.
//
// Row Level Security is enabled on the new tables to match every other Payload
// table in this database (see 20260401_010000_enable_payload_rls).

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "rockets_specs" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "value" varchar
    );
    CREATE TABLE "_rockets_v_version_specs" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar,
      "value" varchar,
      "_uuid" varchar
    );

    ALTER TABLE "rockets_specs" ADD CONSTRAINT "rockets_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rockets"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_rockets_v_version_specs" ADD CONSTRAINT "_rockets_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_rockets_v"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "rockets_specs_order_idx" ON "rockets_specs" USING btree ("_order");
    CREATE INDEX "rockets_specs_parent_id_idx" ON "rockets_specs" USING btree ("_parent_id");
    CREATE INDEX "_rockets_v_version_specs_order_idx" ON "_rockets_v_version_specs" USING btree ("_order");
    CREATE INDEX "_rockets_v_version_specs_parent_id_idx" ON "_rockets_v_version_specs" USING btree ("_parent_id");

    ALTER TABLE "rockets_specs" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "_rockets_v_version_specs" ENABLE ROW LEVEL SECURITY;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "rockets_specs" CASCADE;
    DROP TABLE "_rockets_v_version_specs" CASCADE;
  `);
}
