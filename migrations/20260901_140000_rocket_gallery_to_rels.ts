import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Converts the rocket gallery from an array-of-single-uploads to a `hasMany`
 * upload field.
 *
 * A `hasMany` relation is stored in a `<table>_rels` join table rather than the
 * array's own table, and no collection here had a hasMany relation before, so
 * both join tables have to be created from scratch. Their shape is modelled on
 * `payload_locked_documents_rels`, which Payload generated itself.
 *
 * The old `rockets_gallery` / `_rockets_v_version_gallery` tables are copied
 * but deliberately NOT dropped here: the `path` value Payload expects for a
 * version row is the one thing that cannot be confirmed without running this,
 * so the originals stay as a fallback until a follow-up migration removes them.
 */

const ROCKETS_RELS = `
  CREATE TABLE IF NOT EXISTS "rockets_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "media_id" integer
  );
`;

const ROCKETS_V_RELS = `
  CREATE TABLE IF NOT EXISTS "_rockets_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "media_id" integer
  );
`;

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(ROCKETS_RELS));
  await db.execute(sql.raw(ROCKETS_V_RELS));

  // Foreign keys mirror payload_locked_documents_rels: cascade from both the
  // owning document and the referenced media row.
  await db.execute(sql`
    ALTER TABLE "rockets_rels"
      ADD CONSTRAINT "rockets_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."rockets"("id") ON DELETE cascade ON UPDATE no action
  `);
  await db.execute(sql`
    ALTER TABLE "rockets_rels"
      ADD CONSTRAINT "rockets_rels_media_fk"
      FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action
  `);
  await db.execute(sql`
    ALTER TABLE "_rockets_v_rels"
      ADD CONSTRAINT "_rockets_v_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."_rockets_v"("id") ON DELETE cascade ON UPDATE no action
  `);
  await db.execute(sql`
    ALTER TABLE "_rockets_v_rels"
      ADD CONSTRAINT "_rockets_v_rels_media_fk"
      FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action
  `);

  for (const table of ["rockets_rels", "_rockets_v_rels"]) {
    for (const column of ["order", "parent_id", "path", "media_id"]) {
      const indexName =
        column === "parent_id"
          ? `${table}_parent_idx`
          : column === "media_id"
            ? `${table}_media_id_idx`
            : `${table}_${column}_idx`;

      await db.execute(
        sql.raw(
          `CREATE INDEX IF NOT EXISTS "${indexName}" ON "${table}" USING btree ("${column}")`,
        ),
      );
    }
  }

  // Supabase requires RLS on every table. `rockets_rels` matches none of the
  // patterns in the original RLS migration, so it must be named explicitly.
  await db.execute(
    sql`ALTER TABLE "rockets_rels" ENABLE ROW LEVEL SECURITY`,
  );
  await db.execute(
    sql`ALTER TABLE "_rockets_v_rels" ENABLE ROW LEVEL SECURITY`,
  );

  // Copy the existing gallery entries across, preserving their order.
  await db.execute(sql`
    INSERT INTO "rockets_rels" ("order", "parent_id", "path", "media_id")
    SELECT "_order", "_parent_id", 'gallery', "image_id"
    FROM "rockets_gallery"
    WHERE "image_id" IS NOT NULL
  `);

  await db.execute(sql`
    INSERT INTO "_rockets_v_rels" ("order", "parent_id", "path", "media_id")
    SELECT "_order", "_parent_id", 'version.gallery', "image_id"
    FROM "_rockets_v_version_gallery"
    WHERE "image_id" IS NOT NULL
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The originals were never dropped, so undoing is just removing the copies.
  await db.execute(sql`DROP TABLE IF EXISTS "rockets_rels"`);
  await db.execute(sql`DROP TABLE IF EXISTS "_rockets_v_rels"`);
}
