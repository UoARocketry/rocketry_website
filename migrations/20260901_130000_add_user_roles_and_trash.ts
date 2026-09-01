import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Two schema changes.
 *
 * 1. `users.role` — previously every logged-in account had full access to the
 *    Users collection, so any committee member could delete the other accounts
 *    and lock the club out. Existing accounts are backfilled to `admin` so
 *    nobody loses access the moment this runs; the column defaults to `editor`
 *    for anyone created afterwards.
 *
 * 2. `deleted_at` on the eight content collections that now set `trash: true`,
 *    turning delete into a recoverable soft-delete with a Trash view.
 *
 * Hand-written rather than generated: `payload migrate:create` needs an
 * interactive TTY to answer its "is this enum new or renamed?" prompt. Column
 * types were taken from information_schema on the live database, not guessed.
 * Running `payload migrate:create` after this has been applied should report
 * no further changes; if it does not, reconcile before committing anything new.
 */

/** Collections with `trash: true`, and their version tables. */
const TRASHED_TABLES = [
  "events",
  "rockets",
  "executives",
  "sponsors",
  "what_we_do",
  "journey_items",
  "team_roles",
  "stats",
];

const VERSION_TABLE: Record<string, string> = {
  events: "_events_v",
  rockets: "_rockets_v",
  executives: "_executives_v",
  sponsors: "_sponsors_v",
  what_we_do: "_what_we_do_v",
  journey_items: "_journey_items_v",
  team_roles: "_team_roles_v",
  stats: "_stats_v",
};

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ---------------------------------------------------------------- roles
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
        CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
      END IF;
    END $$;
  `);

  await db.execute(sql`
    ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "role" "enum_users_role" DEFAULT 'editor' NOT NULL
  `);

  // Everyone who already had an account keeps full access. Demote from the
  // admin UI afterwards rather than locking anyone out here.
  await db.execute(sql`UPDATE "users" SET "role" = 'admin'`);

  // `name` became required in the config. Backfilling stops an existing
  // account being unsaveable until someone retypes a name.
  await db.execute(sql`
    UPDATE "users"
    SET "name" = split_part("email", '@', 1)
    WHERE "name" IS NULL OR btrim("name") = ''
  `);

  // ---------------------------------------------------------------- trash
  for (const table of TRASHED_TABLES) {
    const versionTable = VERSION_TABLE[table];

    await db.execute(
      sql.raw(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp(3) with time zone`,
      ),
    );
    await db.execute(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS "${table}_deleted_at_idx" ON "${table}" USING btree ("deleted_at")`,
      ),
    );

    // Version rows mirror every document field under a `version_` prefix.
    await db.execute(
      sql.raw(
        `ALTER TABLE "${versionTable}" ADD COLUMN IF NOT EXISTS "version_deleted_at" timestamp(3) with time zone`,
      ),
    );
    await db.execute(
      sql.raw(
        `CREATE INDEX IF NOT EXISTS "${versionTable}_version_version_deleted_at_idx" ON "${versionTable}" USING btree ("version_deleted_at")`,
      ),
    );
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of TRASHED_TABLES) {
    const versionTable = VERSION_TABLE[table];

    await db.execute(
      sql.raw(`DROP INDEX IF EXISTS "${table}_deleted_at_idx"`),
    );
    await db.execute(
      sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "deleted_at"`),
    );
    await db.execute(
      sql.raw(
        `DROP INDEX IF EXISTS "${versionTable}_version_version_deleted_at_idx"`,
      ),
    );
    await db.execute(
      sql.raw(
        `ALTER TABLE "${versionTable}" DROP COLUMN IF EXISTS "version_deleted_at"`,
      ),
    );
  }

  await db.execute(sql`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_users_role"`);
}
