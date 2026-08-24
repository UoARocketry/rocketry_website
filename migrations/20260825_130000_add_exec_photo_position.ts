import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "executives" ADD COLUMN "photo_position" varchar DEFAULT '50% 50%';
    ALTER TABLE "_executives_v" ADD COLUMN "version_photo_position" varchar DEFAULT '50% 50%';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "executives" DROP COLUMN IF EXISTS "photo_position";
    ALTER TABLE "_executives_v" DROP COLUMN IF EXISTS "version_photo_position";
  `);
}
