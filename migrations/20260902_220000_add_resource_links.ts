import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Gives events and rockets a list of labelled links, plus a heading for it.
 *
 * Anything that lives elsewhere and is worth linking: a spreadsheet of
 * telemetry, an OpenRocket file, the slides for a workshop. Deliberately
 * separate from a rocket's `videos`, which render as a play button and are a
 * different kind of thing.
 *
 * The heading is per document and defaults to "Resources" at render time
 * rather than in the column, so an existing row reading NULL is the same as
 * one never touched.
 */

/** One array table per owner, matching the shape Payload generated for videos. */
const ARRAYS = [
  { table: "events_links", parent: "events", idType: "varchar" },
  {
    table: "_events_v_version_links",
    parent: "_events_v",
    idType: "serial",
  },
  { table: "rockets_links", parent: "rockets", idType: "varchar" },
  {
    table: "_rockets_v_version_links",
    parent: "_rockets_v",
    idType: "serial",
  },
] as const;

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { table, parent, idType } of ARRAYS) {
    // A version table carries a `_uuid` tying the row back to the live one.
    const uuidColumn = idType === "serial" ? `,\n      "_uuid" varchar` : "";

    await db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS "${table}" (
          "_order" integer NOT NULL,
          "_parent_id" integer NOT NULL,
          "id" ${idType} PRIMARY KEY NOT NULL,
          "label" varchar,
          "url" varchar${uuidColumn}
        );
      `),
    );

    await db.execute(
      sql.raw(`
        ALTER TABLE "${table}"
          ADD CONSTRAINT "${table}_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."${parent}"("id")
          ON DELETE cascade ON UPDATE no action;
      `),
    );

    await db.execute(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS "${table}_order_idx" ON "${table}" USING btree ("_order");`,
      ),
    );
    await db.execute(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS "${table}_parent_id_idx" ON "${table}" USING btree ("_parent_id");`,
      ),
    );

    // Supabase requires RLS on every table.
    await db.execute(
      sql.raw(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`),
    );
  }

  await db.execute(sql`
    ALTER TABLE "events" ADD COLUMN "links_heading" varchar;
    ALTER TABLE "_events_v" ADD COLUMN "version_links_heading" varchar;
    ALTER TABLE "rockets" ADD COLUMN "links_heading" varchar;
    ALTER TABLE "_rockets_v" ADD COLUMN "version_links_heading" varchar;

    -- Videos become a titled section too, so they get the same treatment.
    ALTER TABLE "rockets" ADD COLUMN "videos_heading" varchar;
    ALTER TABLE "_rockets_v" ADD COLUMN "version_videos_heading" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const { table } of ARRAYS) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE;`));
  }

  await db.execute(sql`
    ALTER TABLE "events" DROP COLUMN IF EXISTS "links_heading";
    ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_links_heading";
    ALTER TABLE "rockets" DROP COLUMN IF EXISTS "links_heading";
    ALTER TABLE "_rockets_v" DROP COLUMN IF EXISTS "version_links_heading";
    ALTER TABLE "rockets" DROP COLUMN IF EXISTS "videos_heading";
    ALTER TABLE "_rockets_v" DROP COLUMN IF EXISTS "version_videos_heading";
  `);
}
