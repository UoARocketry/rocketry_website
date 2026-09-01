import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * A link to the rocket's launch footage, shown as a button on its page.
 *
 * Nullable with no default: a rocket that has not flown, or whose flight was
 * never filmed, simply shows no button.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rockets" ADD COLUMN "launch_video_url" varchar;
    ALTER TABLE "_rockets_v" ADD COLUMN "version_launch_video_url" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "rockets" DROP COLUMN IF EXISTS "launch_video_url";
    ALTER TABLE "_rockets_v" DROP COLUMN IF EXISTS "version_launch_video_url";
  `);
}
