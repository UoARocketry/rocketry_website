import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Lets a sponsor say its logo needs a dark backing.
 *
 * Logos sit on a white plate, which suits dark and full-colour artwork. Plenty
 * of companies supply a white-only reverse logo as their primary download, and
 * on white that renders as an empty card. Nothing in the file says which kind
 * it is, so the editor has to.
 *
 * Defaults to 'light', which is what every existing sponsor already gets.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_sponsors_logo_plate" AS ENUM('light', 'dark');
    CREATE TYPE "public"."enum__sponsors_v_version_logo_plate" AS ENUM('light', 'dark');

    ALTER TABLE "sponsors"
      ADD COLUMN "logo_plate" "public"."enum_sponsors_logo_plate" DEFAULT 'light';
    ALTER TABLE "_sponsors_v"
      ADD COLUMN "version_logo_plate" "public"."enum__sponsors_v_version_logo_plate" DEFAULT 'light';

    -- Payload's defaultValue only applies to newly created documents, so
    -- existing rows are backfilled explicitly.
    UPDATE "sponsors" SET "logo_plate" = 'light' WHERE "logo_plate" IS NULL;
    UPDATE "_sponsors_v" SET "version_logo_plate" = 'light' WHERE "version_logo_plate" IS NULL;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sponsors" DROP COLUMN IF EXISTS "logo_plate";
    ALTER TABLE "_sponsors_v" DROP COLUMN IF EXISTS "version_logo_plate";

    DROP TYPE IF EXISTS "public"."enum_sponsors_logo_plate";
    DROP TYPE IF EXISTS "public"."enum__sponsors_v_version_logo_plate";
  `);
}
