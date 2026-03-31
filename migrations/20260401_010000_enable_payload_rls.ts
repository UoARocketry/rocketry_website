import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

const enableRlsSql = sql`
    DO $$
    DECLARE
      table_name text;
    BEGIN
      FOR table_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND (
            tablename IN (
              'users',
              'users_sessions',
              'media',
              'events',
              'rockets',
              'executives',
              'sponsors',
              'what_we_do',
              'journey_items',
              'team_roles',
              'team_roles_bullets',
              'stats',
              'site_settings'
            )
            OR tablename LIKE 'payload\\_%' ESCAPE '\\'
            OR tablename LIKE '\\_%\\_v' ESCAPE '\\'
            OR tablename LIKE '\\_%\\_v\\_%' ESCAPE '\\'
          )
      LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      END LOOP;
    END $$;
  `;

const disableRlsSql = sql`
    DO $$
    DECLARE
      table_name text;
    BEGIN
      FOR table_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND (
            tablename IN (
              'users',
              'users_sessions',
              'media',
              'events',
              'rockets',
              'executives',
              'sponsors',
              'what_we_do',
              'journey_items',
              'team_roles',
              'team_roles_bullets',
              'stats',
              'site_settings'
            )
            OR tablename LIKE 'payload\\_%' ESCAPE '\\'
            OR tablename LIKE '\\_%\\_v' ESCAPE '\\'
            OR tablename LIKE '\\_%\\_v\\_%' ESCAPE '\\'
          )
      LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', table_name);
      END LOOP;
    END $$;
  `;

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(enableRlsSql);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(disableRlsSql);
}
