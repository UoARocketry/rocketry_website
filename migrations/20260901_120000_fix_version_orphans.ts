import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

/**
 * Fixes the "phantom row in the admin list" bug.
 *
 * Payload deletes a document's versions before deleting the document, but
 * `deleteCollectionVersions` swallows any error from that step and only logs
 * it (see node_modules/payload/dist/versions/deleteCollectionVersions.js).
 * When that happens the parent delete still goes ahead, and because every
 * `_*_v.parent_id` foreign key was `ON DELETE SET NULL`, the version rows
 * survive with a null parent instead of being removed.
 *
 * Payload's draft-aware list query groups versions by `parent_id`, so the null
 * group renders as a document whose id is null: the row shows in /admin, is
 * absent from the website, and clicking it reports "The document with ID null
 * could not be found". Four such rows existed for a deleted executive.
 *
 * Two changes:
 *   1. Delete the orphans. A null `parent_id` is unreachable by definition, so
 *      no document can ever own these rows again.
 *   2. Switch the foreign keys to ON DELETE CASCADE so Postgres removes
 *      versions atomically with the parent. A swallowed cleanup error can then
 *      no longer leave anything behind.
 *
 * NOTE FOR FUTURE MIGRATIONS: `SET NULL` is what Payload's own schema builder
 * emits for these keys, so a future `payload migrate:create` may try to revert
 * this. Keep CASCADE.
 */

const VERSION_TABLES = [
  "_events_v",
  "_rockets_v",
  "_executives_v",
  "_sponsors_v",
  "_what_we_do_v",
  "_journey_items_v",
  "_team_roles_v",
  "_stats_v",
];

const PARENT_TABLES: Record<string, string> = {
  _events_v: "events",
  _rockets_v: "rockets",
  _executives_v: "executives",
  _sponsors_v: "sponsors",
  _what_we_do_v: "what_we_do",
  _journey_items_v: "journey_items",
  _team_roles_v: "team_roles",
  _stats_v: "stats",
};

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const versionTable of VERSION_TABLES) {
    const parentTable = PARENT_TABLES[versionTable];
    const constraint = `${versionTable}_parent_id_${parentTable}_id_fk`;

    // 1. Remove rows that can no longer belong to any document.
    await db.execute(
      sql.raw(`DELETE FROM "${versionTable}" WHERE parent_id IS NULL`),
    );

    // 2. Re-point the key at CASCADE. Dropping first keeps this rerunnable.
    await db.execute(
      sql.raw(
        `ALTER TABLE "${versionTable}" DROP CONSTRAINT IF EXISTS "${constraint}"`,
      ),
    );
    await db.execute(
      sql.raw(
        `ALTER TABLE "${versionTable}"
           ADD CONSTRAINT "${constraint}"
           FOREIGN KEY ("parent_id") REFERENCES "public"."${parentTable}"("id")
           ON DELETE CASCADE ON UPDATE NO ACTION`,
      ),
    );
  }
}

/**
 * Restores the original SET NULL behaviour. The deleted orphan rows are not
 * recoverable, which is intentional: they were unreachable data.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const versionTable of VERSION_TABLES) {
    const parentTable = PARENT_TABLES[versionTable];
    const constraint = `${versionTable}_parent_id_${parentTable}_id_fk`;

    await db.execute(
      sql.raw(
        `ALTER TABLE "${versionTable}" DROP CONSTRAINT IF EXISTS "${constraint}"`,
      ),
    );
    await db.execute(
      sql.raw(
        `ALTER TABLE "${versionTable}"
           ADD CONSTRAINT "${constraint}"
           FOREIGN KEY ("parent_id") REFERENCES "public"."${parentTable}"("id")
           ON DELETE SET NULL ON UPDATE NO ACTION`,
      ),
    );
  }
}
