import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Removes the old rocket gallery array tables, now that
 * `20260901_140000_rocket_gallery_to_rels` has been applied and the data was
 * confirmed to read back through Payload from the new join tables (both the
 * published read and the draft read returned the migrated media).
 *
 * Kept as a separate migration on purpose: the `path` value the join tables
 * needed could not be verified until the previous migration had run, so the
 * originals stayed in place as a fallback until it was.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "rockets_gallery"`);
  await db.execute(sql`DROP TABLE IF EXISTS "_rockets_v_version_gallery"`);
}

/**
 * Recreates the empty array tables. Their contents are not restored: the data
 * lives in `rockets_rels` / `_rockets_v_rels` after the previous migration, and
 * rolling this back is only meant to restore the shape.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "rockets_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    )
  `);
  await db.execute(sql`
    ALTER TABLE "rockets_gallery"
      ADD CONSTRAINT "rockets_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."rockets"("id") ON DELETE cascade ON UPDATE no action
  `);
  await db.execute(sql`
    ALTER TABLE "rockets_gallery"
      ADD CONSTRAINT "rockets_gallery_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_rockets_v_version_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "_uuid" varchar
    )
  `);
  await db.execute(sql`
    ALTER TABLE "_rockets_v_version_gallery"
      ADD CONSTRAINT "_rockets_v_version_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_rockets_v"("id") ON DELETE cascade ON UPDATE no action
  `);

  await db.execute(sql`ALTER TABLE "rockets_gallery" ENABLE ROW LEVEL SECURITY`);
  await db.execute(
    sql`ALTER TABLE "_rockets_v_version_gallery" ENABLE ROW LEVEL SECURITY`,
  );
}
