import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Extends the exec headshot's drag-to-position framing to the other images the
 * site crops to fill a frame: rocket cards, and the What We Do and Journey
 * blocks on the About page.
 *
 * The default matches the centred crop those images already render with, so
 * existing rows look identical until someone actually reframes one.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rockets" ADD COLUMN "image_position" varchar DEFAULT '50% 50%';
    ALTER TABLE "_rockets_v" ADD COLUMN "version_image_position" varchar DEFAULT '50% 50%';
    ALTER TABLE "what_we_do" ADD COLUMN "image_position" varchar DEFAULT '50% 50%';
    ALTER TABLE "_what_we_do_v" ADD COLUMN "version_image_position" varchar DEFAULT '50% 50%';
    ALTER TABLE "journey_items" ADD COLUMN "image_position" varchar DEFAULT '50% 50%';
    ALTER TABLE "_journey_items_v" ADD COLUMN "version_image_position" varchar DEFAULT '50% 50%';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rockets" DROP COLUMN IF EXISTS "image_position";
    ALTER TABLE "_rockets_v" DROP COLUMN IF EXISTS "version_image_position";
    ALTER TABLE "what_we_do" DROP COLUMN IF EXISTS "image_position";
    ALTER TABLE "_what_we_do_v" DROP COLUMN IF EXISTS "version_image_position";
    ALTER TABLE "journey_items" DROP COLUMN IF EXISTS "image_position";
    ALTER TABLE "_journey_items_v" DROP COLUMN IF EXISTS "version_image_position";
  `);
}
