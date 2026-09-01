import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Records which parts of the site each image is used in, so the Media library
 * can be filtered by area instead of being one long undifferentiated list.
 *
 * Kept current by hooks on every collection that references an image. This
 * migration seeds it from the relation columns that already exist, so the
 * twenty images uploaded before today are labelled without anyone re-saving
 * them. An image nothing references is left with no rows, which is what makes
 * "unused" findable.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_media_used_in" AS ENUM('events', 'rockets', 'executives', 'sponsors', 'what-we-do', 'journey-items', 'site-settings');

    CREATE TABLE "media_used_in" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "public"."enum_media_used_in",
      "id" serial PRIMARY KEY NOT NULL
    );

    ALTER TABLE "media_used_in" ADD CONSTRAINT "media_used_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "media_used_in_order_idx" ON "media_used_in" USING btree ("order");
    CREATE INDEX "media_used_in_parent_idx" ON "media_used_in" USING btree ("parent_id");

    ALTER TABLE "media_used_in" ENABLE ROW LEVEL SECURITY;

    -- Seed from what the database already knows. Every source is unioned first
    -- so an image used twice in one area (a rocket's cover and its gallery)
    -- produces a single row.
    INSERT INTO "media_used_in" ("order", "parent_id", "value")
    SELECT row_number() OVER (PARTITION BY usage.media_id ORDER BY usage.value),
           usage.media_id,
           usage.value::"public"."enum_media_used_in"
    FROM (
      SELECT DISTINCT media_id, value FROM (
        SELECT image_media_id AS media_id, 'events' AS value FROM "events" WHERE image_media_id IS NOT NULL
        UNION ALL
        SELECT image_media_id, 'rockets' FROM "rockets" WHERE image_media_id IS NOT NULL
        UNION ALL
        SELECT media_id, 'rockets' FROM "rockets_rels" WHERE media_id IS NOT NULL
        UNION ALL
        SELECT photo_media_id, 'executives' FROM "executives" WHERE photo_media_id IS NOT NULL
        UNION ALL
        SELECT logo_media_id, 'sponsors' FROM "sponsors" WHERE logo_media_id IS NOT NULL
        UNION ALL
        SELECT image_media_id, 'what-we-do' FROM "what_we_do" WHERE image_media_id IS NOT NULL
        UNION ALL
        SELECT image_media_id, 'journey-items' FROM "journey_items" WHERE image_media_id IS NOT NULL
        UNION ALL
        SELECT exec_team_image_media_id, 'site-settings' FROM "site_settings" WHERE exec_team_image_media_id IS NOT NULL
      ) AS sources
    ) AS usage;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "media_used_in" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_media_used_in";
  `);
}
