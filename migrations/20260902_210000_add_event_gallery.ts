import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Gives an event a gallery, the same `hasMany` upload rockets already have.
 *
 * A `hasMany` relation lives in a `<table>_rels` join table, and events had no
 * such table: its one relationship, `eventTag`, is a single relation and so
 * sits in a plain `event_tag_id` column. Both join tables are therefore new,
 * and are modelled on `rockets_rels`, which Payload accepted.
 *
 * Nothing is backfilled. Every existing event keeps its single poster in
 * `image`/`image_media_id`, which stays the cover the cards use.
 */

const columns = `
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "media_id" integer
`;

const TABLES = [
  { name: "events_rels", parent: "events" },
  { name: "_events_v_rels", parent: "_events_v" },
] as const;

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { name, parent } of TABLES) {
    await db.execute(
      sql.raw(`CREATE TABLE IF NOT EXISTS "${name}" (${columns});`),
    );

    // Cascade from both the owning document and the referenced media row, so
    // deleting either never leaves a dangling join row behind.
    await db.execute(
      sql.raw(`
        ALTER TABLE "${name}"
          ADD CONSTRAINT "${name}_parent_fk"
          FOREIGN KEY ("parent_id") REFERENCES "public"."${parent}"("id")
          ON DELETE cascade ON UPDATE no action
      `),
    );
    await db.execute(
      sql.raw(`
        ALTER TABLE "${name}"
          ADD CONSTRAINT "${name}_media_fk"
          FOREIGN KEY ("media_id") REFERENCES "public"."media"("id")
          ON DELETE cascade ON UPDATE no action
      `),
    );

    for (const column of ["order", "parent_id", "path", "media_id"]) {
      const indexName =
        column === "parent_id"
          ? `${name}_parent_idx`
          : column === "media_id"
            ? `${name}_media_id_idx`
            : `${name}_${column}_idx`;

      await db.execute(
        sql.raw(
          `CREATE INDEX IF NOT EXISTS "${indexName}" ON "${name}" USING btree ("${column}")`,
        ),
      );
    }

    // Supabase requires RLS on every table, and a new one matches none of the
    // patterns in the original RLS migration.
    await db.execute(sql.raw(`ALTER TABLE "${name}" ENABLE ROW LEVEL SECURITY`));
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "events_rels"`);
  await db.execute(sql`DROP TABLE IF EXISTS "_events_v_rels"`);
}
