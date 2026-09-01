import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Lets an event say how people sign up, rather than assuming a link exists.
 *
 * Some events only have "the form is in our Instagram bio", which previously
 * had to be smuggled into the description or left out. `signup_type` picks
 * between a link, a sentence, or nothing at all.
 *
 * Existing rows are backfilled to 'link' wherever a URL is already present, so
 * no event loses its Sign Up button. Payload's `defaultValue` only applies to
 * newly created documents and would leave older rows null.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_events_signup_type" AS ENUM('none', 'link', 'text');
    CREATE TYPE "public"."enum__events_v_version_signup_type" AS ENUM('none', 'link', 'text');

    ALTER TABLE "events" ADD COLUMN "signup_type" "public"."enum_events_signup_type" DEFAULT 'none';
    ALTER TABLE "events" ADD COLUMN "signup_note" varchar;
    ALTER TABLE "_events_v" ADD COLUMN "version_signup_type" "public"."enum__events_v_version_signup_type" DEFAULT 'none';
    ALTER TABLE "_events_v" ADD COLUMN "version_signup_note" varchar;

    UPDATE "events" SET "signup_type" = 'link'
      WHERE "signup_url" IS NOT NULL AND btrim("signup_url") <> '';
    UPDATE "_events_v" SET "version_signup_type" = 'link'
      WHERE "version_signup_url" IS NOT NULL AND btrim("version_signup_url") <> '';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "events" DROP COLUMN IF EXISTS "signup_type";
    ALTER TABLE "events" DROP COLUMN IF EXISTS "signup_note";
    ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_signup_type";
    ALTER TABLE "_events_v" DROP COLUMN IF EXISTS "version_signup_note";

    DROP TYPE IF EXISTS "public"."enum_events_signup_type";
    DROP TYPE IF EXISTS "public"."enum__events_v_version_signup_type";
  `);
}
