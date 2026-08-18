import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN "discord_url" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "instagram_url" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "linkedin_url" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN "version_discord_url" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN "version_instagram_url" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN "version_linkedin_url" varchar;

    UPDATE "site_settings" SET
      "discord_url" = 'https://discord.gg/6tRynaXga9',
      "instagram_url" = 'https://www.instagram.com/uoarocketryclub/',
      "linkedin_url" = 'https://www.linkedin.com/company/the-university-of-auckland-rocketry-club/home/';

    UPDATE "_site_settings_v" SET
      "version_discord_url" = 'https://discord.gg/6tRynaXga9',
      "version_instagram_url" = 'https://www.instagram.com/uoarocketryclub/',
      "version_linkedin_url" = 'https://www.linkedin.com/company/the-university-of-auckland-rocketry-club/home/'
    WHERE "latest" = true;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN "discord_url";
    ALTER TABLE "site_settings" DROP COLUMN "instagram_url";
    ALTER TABLE "site_settings" DROP COLUMN "linkedin_url";
    ALTER TABLE "_site_settings_v" DROP COLUMN "version_discord_url";
    ALTER TABLE "_site_settings_v" DROP COLUMN "version_instagram_url";
    ALTER TABLE "_site_settings_v" DROP COLUMN "version_linkedin_url";
  `);
}
