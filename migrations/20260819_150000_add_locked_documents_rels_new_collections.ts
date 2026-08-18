import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_tags_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sponsor_tiers_id" integer;

    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_tags_fk" FOREIGN KEY ("event_tags_id") REFERENCES "public"."event_tags"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sponsor_tiers_fk" FOREIGN KEY ("sponsor_tiers_id") REFERENCES "public"."sponsor_tiers"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "payload_locked_documents_rels_event_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("event_tags_id");
    CREATE INDEX "payload_locked_documents_rels_sponsor_tiers_id_idx" ON "payload_locked_documents_rels" USING btree ("sponsor_tiers_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "payload_locked_documents_rels_event_tags_id_idx";
    DROP INDEX "payload_locked_documents_rels_sponsor_tiers_id_idx";

    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_tags_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sponsor_tiers_fk";

    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_tags_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sponsor_tiers_id";
  `);
}
