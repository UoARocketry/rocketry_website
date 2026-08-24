import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN "database_limit_mb" numeric DEFAULT 500;
    ALTER TABLE "site_settings" ADD COLUMN "storage_limit_mb" numeric DEFAULT 1024;
    ALTER TABLE "_site_settings_v" ADD COLUMN "version_database_limit_mb" numeric DEFAULT 500;
    ALTER TABLE "_site_settings_v" ADD COLUMN "version_storage_limit_mb" numeric DEFAULT 1024;

    UPDATE "site_settings"
      SET "database_limit_mb" = 500, "storage_limit_mb" = 1024
      WHERE "database_limit_mb" IS NULL OR "storage_limit_mb" IS NULL;

    UPDATE "_site_settings_v"
      SET "version_database_limit_mb" = 500, "version_storage_limit_mb" = 1024
      WHERE "latest" = true;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "database_limit_mb";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "storage_limit_mb";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_database_limit_mb";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_storage_limit_mb";
  `);
}
