import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

// NOTE: values must be inlined as SQL literals, not interpolated as template
// parameters. Interpolating turns this into a prepared statement, and Postgres
// rejects prepared statements containing multiple commands.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN "contact_email" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN "version_contact_email" varchar;

    UPDATE "site_settings"
      SET "contact_email" = 'uoarocketryclub@gmail.com'
      WHERE "contact_email" IS NULL;

    UPDATE "_site_settings_v"
      SET "version_contact_email" = 'uoarocketryclub@gmail.com'
      WHERE "latest" = true;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "contact_email";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_contact_email";
  `);
}
