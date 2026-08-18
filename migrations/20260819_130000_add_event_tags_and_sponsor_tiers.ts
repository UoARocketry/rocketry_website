import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "event_tags" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "order" numeric DEFAULT 1,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "event_tags_name_idx" ON "event_tags" USING btree ("name");
    CREATE INDEX "event_tags_updated_at_idx" ON "event_tags" USING btree ("updated_at");
    CREATE INDEX "event_tags_created_at_idx" ON "event_tags" USING btree ("created_at");
    ALTER TABLE "event_tags" ENABLE ROW LEVEL SECURITY;

    CREATE TABLE "sponsor_tiers" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "description" varchar,
      "order" numeric DEFAULT 1,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "sponsor_tiers_name_idx" ON "sponsor_tiers" USING btree ("name");
    CREATE INDEX "sponsor_tiers_updated_at_idx" ON "sponsor_tiers" USING btree ("updated_at");
    CREATE INDEX "sponsor_tiers_created_at_idx" ON "sponsor_tiers" USING btree ("created_at");
    ALTER TABLE "sponsor_tiers" ENABLE ROW LEVEL SECURITY;

    -- Seed event_tags from every distinct existing free-text value (live + draft versions)
    INSERT INTO "event_tags" ("name", "order")
    SELECT name, ROW_NUMBER() OVER (ORDER BY name)
    FROM (
      SELECT DISTINCT TRIM("event_tag") AS name FROM "events" WHERE TRIM("event_tag") <> ''
      UNION
      SELECT DISTINCT TRIM("version_event_tag") AS name FROM "_events_v" WHERE TRIM("version_event_tag") <> ''
    ) AS distinct_tags;

    -- Seed sponsor_tiers with the three tiers that previously existed as a fixed enum
    INSERT INTO "sponsor_tiers" ("name", "description", "order") VALUES
      ('Gold', 'Our premier partners making major contributions', 1),
      ('Silver', 'Valued supporters of our rocketry endeavors', 2),
      ('Bronze', 'Appreciated contributors to our mission', 3);

    ALTER TABLE "events" ADD COLUMN "event_tag_id" integer;
    ALTER TABLE "_events_v" ADD COLUMN "version_event_tag_id" integer;
    ALTER TABLE "sponsors" ADD COLUMN "tier_id" integer;
    ALTER TABLE "_sponsors_v" ADD COLUMN "version_tier_id" integer;

    UPDATE "events" SET "event_tag_id" = "event_tags"."id"
      FROM "event_tags" WHERE TRIM("events"."event_tag") = "event_tags"."name";
    UPDATE "_events_v" SET "version_event_tag_id" = "event_tags"."id"
      FROM "event_tags" WHERE TRIM("_events_v"."version_event_tag") = "event_tags"."name";

    UPDATE "sponsors" SET "tier_id" = "sponsor_tiers"."id"
      FROM "sponsor_tiers"
      WHERE ("sponsors"."tier" = 'GOLD' AND "sponsor_tiers"."name" = 'Gold')
         OR ("sponsors"."tier" = 'SILVER' AND "sponsor_tiers"."name" = 'Silver')
         OR ("sponsors"."tier" = 'BRONZE' AND "sponsor_tiers"."name" = 'Bronze');
    UPDATE "_sponsors_v" SET "version_tier_id" = "sponsor_tiers"."id"
      FROM "sponsor_tiers"
      WHERE ("_sponsors_v"."version_tier" = 'GOLD' AND "sponsor_tiers"."name" = 'Gold')
         OR ("_sponsors_v"."version_tier" = 'SILVER' AND "sponsor_tiers"."name" = 'Silver')
         OR ("_sponsors_v"."version_tier" = 'BRONZE' AND "sponsor_tiers"."name" = 'Bronze');

    ALTER TABLE "events" ADD CONSTRAINT "events_event_tag_id_event_tags_id_fk" FOREIGN KEY ("event_tag_id") REFERENCES "public"."event_tags"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_event_tag_id_event_tags_id_fk" FOREIGN KEY ("version_event_tag_id") REFERENCES "public"."event_tags"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_tier_id_sponsor_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."sponsor_tiers"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_sponsors_v" ADD CONSTRAINT "_sponsors_v_version_tier_id_sponsor_tiers_id_fk" FOREIGN KEY ("version_tier_id") REFERENCES "public"."sponsor_tiers"("id") ON DELETE set null ON UPDATE no action;

    CREATE INDEX "events_event_tag_idx" ON "events" USING btree ("event_tag_id");
    CREATE INDEX "_events_v_version_version_event_tag_idx" ON "_events_v" USING btree ("version_event_tag_id");
    CREATE INDEX "sponsors_tier_idx" ON "sponsors" USING btree ("tier_id");
    CREATE INDEX "_sponsors_v_version_version_tier_idx" ON "_sponsors_v" USING btree ("version_tier_id");

    ALTER TABLE "events" DROP COLUMN "event_tag";
    ALTER TABLE "_events_v" DROP COLUMN "version_event_tag";
    ALTER TABLE "sponsors" DROP COLUMN "tier";
    ALTER TABLE "_sponsors_v" DROP COLUMN "version_tier";

    DROP TYPE "public"."enum_sponsors_tier";
    DROP TYPE "public"."enum__sponsors_v_version_tier";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_sponsors_tier" AS ENUM('GOLD', 'SILVER', 'BRONZE');
    CREATE TYPE "public"."enum__sponsors_v_version_tier" AS ENUM('GOLD', 'SILVER', 'BRONZE');

    ALTER TABLE "events" ADD COLUMN "event_tag" varchar;
    ALTER TABLE "_events_v" ADD COLUMN "version_event_tag" varchar;
    ALTER TABLE "sponsors" ADD COLUMN "tier" "enum_sponsors_tier";
    ALTER TABLE "_sponsors_v" ADD COLUMN "version_tier" "enum__sponsors_v_version_tier";

    UPDATE "events" SET "event_tag" = "event_tags"."name"
      FROM "event_tags" WHERE "events"."event_tag_id" = "event_tags"."id";
    UPDATE "_events_v" SET "version_event_tag" = "event_tags"."name"
      FROM "event_tags" WHERE "_events_v"."version_event_tag_id" = "event_tags"."id";

    UPDATE "sponsors" SET "tier" = CASE "sponsor_tiers"."name"
        WHEN 'Gold' THEN 'GOLD'::"public"."enum_sponsors_tier"
        WHEN 'Silver' THEN 'SILVER'::"public"."enum_sponsors_tier"
        WHEN 'Bronze' THEN 'BRONZE'::"public"."enum_sponsors_tier"
      END
      FROM "sponsor_tiers" WHERE "sponsors"."tier_id" = "sponsor_tiers"."id";
    UPDATE "_sponsors_v" SET "version_tier" = CASE "sponsor_tiers"."name"
        WHEN 'Gold' THEN 'GOLD'::"public"."enum__sponsors_v_version_tier"
        WHEN 'Silver' THEN 'SILVER'::"public"."enum__sponsors_v_version_tier"
        WHEN 'Bronze' THEN 'BRONZE'::"public"."enum__sponsors_v_version_tier"
      END
      FROM "sponsor_tiers" WHERE "_sponsors_v"."version_tier_id" = "sponsor_tiers"."id";

    ALTER TABLE "events" DROP CONSTRAINT "events_event_tag_id_event_tags_id_fk";
    ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_event_tag_id_event_tags_id_fk";
    ALTER TABLE "sponsors" DROP CONSTRAINT "sponsors_tier_id_sponsor_tiers_id_fk";
    ALTER TABLE "_sponsors_v" DROP CONSTRAINT "_sponsors_v_version_tier_id_sponsor_tiers_id_fk";

    DROP INDEX "events_event_tag_idx";
    DROP INDEX "_events_v_version_version_event_tag_idx";
    DROP INDEX "sponsors_tier_idx";
    DROP INDEX "_sponsors_v_version_version_tier_idx";

    ALTER TABLE "events" DROP COLUMN "event_tag_id";
    ALTER TABLE "_events_v" DROP COLUMN "version_event_tag_id";
    ALTER TABLE "sponsors" DROP COLUMN "tier_id";
    ALTER TABLE "_sponsors_v" DROP COLUMN "version_tier_id";

    DROP TABLE "sponsor_tiers" CASCADE;
    DROP TABLE "event_tags" CASCADE;
  `);
}
