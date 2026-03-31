import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "events" ADD COLUMN "image_media_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_image_media_id" integer;
  ALTER TABLE "rockets" ADD COLUMN "image_media_id" integer;
  ALTER TABLE "_rockets_v" ADD COLUMN "version_image_media_id" integer;
  ALTER TABLE "executives" ADD COLUMN "photo_media_id" integer;
  ALTER TABLE "_executives_v" ADD COLUMN "version_photo_media_id" integer;
  ALTER TABLE "sponsors" ADD COLUMN "logo_media_id" integer;
  ALTER TABLE "_sponsors_v" ADD COLUMN "version_logo_media_id" integer;
  ALTER TABLE "what_we_do" ADD COLUMN "image_media_id" integer;
  ALTER TABLE "_what_we_do_v" ADD COLUMN "version_image_media_id" integer;
  ALTER TABLE "journey_items" ADD COLUMN "image_media_id" integer;
  ALTER TABLE "_journey_items_v" ADD COLUMN "version_image_media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "exec_team_image_media_id" integer;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_exec_team_image_media_id" integer;
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  ALTER TABLE "events" ADD CONSTRAINT "events_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_image_media_id_media_id_fk" FOREIGN KEY ("version_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rockets" ADD CONSTRAINT "rockets_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rockets_v" ADD CONSTRAINT "_rockets_v_version_image_media_id_media_id_fk" FOREIGN KEY ("version_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "executives" ADD CONSTRAINT "executives_photo_media_id_media_id_fk" FOREIGN KEY ("photo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_executives_v" ADD CONSTRAINT "_executives_v_version_photo_media_id_media_id_fk" FOREIGN KEY ("version_photo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_logo_media_id_media_id_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sponsors_v" ADD CONSTRAINT "_sponsors_v_version_logo_media_id_media_id_fk" FOREIGN KEY ("version_logo_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "what_we_do" ADD CONSTRAINT "what_we_do_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_what_we_do_v" ADD CONSTRAINT "_what_we_do_v_version_image_media_id_media_id_fk" FOREIGN KEY ("version_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journey_items" ADD CONSTRAINT "journey_items_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journey_items_v" ADD CONSTRAINT "_journey_items_v_version_image_media_id_media_id_fk" FOREIGN KEY ("version_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_exec_team_image_media_id_media_id_fk" FOREIGN KEY ("exec_team_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_exec_team_image_media_id_media_id_fk" FOREIGN KEY ("version_exec_team_image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_image_media_idx" ON "events" USING btree ("image_media_id");
  CREATE INDEX "_events_v_version_version_image_media_idx" ON "_events_v" USING btree ("version_image_media_id");
  CREATE INDEX "rockets_image_media_idx" ON "rockets" USING btree ("image_media_id");
  CREATE INDEX "_rockets_v_version_version_image_media_idx" ON "_rockets_v" USING btree ("version_image_media_id");
  CREATE INDEX "executives_photo_media_idx" ON "executives" USING btree ("photo_media_id");
  CREATE INDEX "_executives_v_version_version_photo_media_idx" ON "_executives_v" USING btree ("version_photo_media_id");
  CREATE INDEX "sponsors_logo_media_idx" ON "sponsors" USING btree ("logo_media_id");
  CREATE INDEX "_sponsors_v_version_version_logo_media_idx" ON "_sponsors_v" USING btree ("version_logo_media_id");
  CREATE INDEX "what_we_do_image_media_idx" ON "what_we_do" USING btree ("image_media_id");
  CREATE INDEX "_what_we_do_v_version_version_image_media_idx" ON "_what_we_do_v" USING btree ("version_image_media_id");
  CREATE INDEX "journey_items_image_media_idx" ON "journey_items" USING btree ("image_media_id");
  CREATE INDEX "_journey_items_v_version_version_image_media_idx" ON "_journey_items_v" USING btree ("version_image_media_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "site_settings_exec_team_image_media_idx" ON "site_settings" USING btree ("exec_team_image_media_id");
  CREATE INDEX "_site_settings_v_version_version_exec_team_image_media_idx" ON "_site_settings_v" USING btree ("version_exec_team_image_media_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media" CASCADE;
  ALTER TABLE "events" DROP CONSTRAINT "events_image_media_id_media_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_image_media_id_media_id_fk";
  
  ALTER TABLE "rockets" DROP CONSTRAINT "rockets_image_media_id_media_id_fk";
  
  ALTER TABLE "_rockets_v" DROP CONSTRAINT "_rockets_v_version_image_media_id_media_id_fk";
  
  ALTER TABLE "executives" DROP CONSTRAINT "executives_photo_media_id_media_id_fk";
  
  ALTER TABLE "_executives_v" DROP CONSTRAINT "_executives_v_version_photo_media_id_media_id_fk";
  
  ALTER TABLE "sponsors" DROP CONSTRAINT "sponsors_logo_media_id_media_id_fk";
  
  ALTER TABLE "_sponsors_v" DROP CONSTRAINT "_sponsors_v_version_logo_media_id_media_id_fk";
  
  ALTER TABLE "what_we_do" DROP CONSTRAINT "what_we_do_image_media_id_media_id_fk";
  
  ALTER TABLE "_what_we_do_v" DROP CONSTRAINT "_what_we_do_v_version_image_media_id_media_id_fk";
  
  ALTER TABLE "journey_items" DROP CONSTRAINT "journey_items_image_media_id_media_id_fk";
  
  ALTER TABLE "_journey_items_v" DROP CONSTRAINT "_journey_items_v_version_image_media_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_exec_team_image_media_id_media_id_fk";
  
  ALTER TABLE "_site_settings_v" DROP CONSTRAINT "_site_settings_v_version_exec_team_image_media_id_media_id_fk";
  
  DROP INDEX "events_image_media_idx";
  DROP INDEX "_events_v_version_version_image_media_idx";
  DROP INDEX "rockets_image_media_idx";
  DROP INDEX "_rockets_v_version_version_image_media_idx";
  DROP INDEX "executives_photo_media_idx";
  DROP INDEX "_executives_v_version_version_photo_media_idx";
  DROP INDEX "sponsors_logo_media_idx";
  DROP INDEX "_sponsors_v_version_version_logo_media_idx";
  DROP INDEX "what_we_do_image_media_idx";
  DROP INDEX "_what_we_do_v_version_version_image_media_idx";
  DROP INDEX "journey_items_image_media_idx";
  DROP INDEX "_journey_items_v_version_version_image_media_idx";
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  DROP INDEX "site_settings_exec_team_image_media_idx";
  DROP INDEX "_site_settings_v_version_version_exec_team_image_media_idx";
  ALTER TABLE "events" DROP COLUMN "image_media_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_image_media_id";
  ALTER TABLE "rockets" DROP COLUMN "image_media_id";
  ALTER TABLE "_rockets_v" DROP COLUMN "version_image_media_id";
  ALTER TABLE "executives" DROP COLUMN "photo_media_id";
  ALTER TABLE "_executives_v" DROP COLUMN "version_photo_media_id";
  ALTER TABLE "sponsors" DROP COLUMN "logo_media_id";
  ALTER TABLE "_sponsors_v" DROP COLUMN "version_logo_media_id";
  ALTER TABLE "what_we_do" DROP COLUMN "image_media_id";
  ALTER TABLE "_what_we_do_v" DROP COLUMN "version_image_media_id";
  ALTER TABLE "journey_items" DROP COLUMN "image_media_id";
  ALTER TABLE "_journey_items_v" DROP COLUMN "version_image_media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "site_settings" DROP COLUMN "exec_team_image_media_id";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_exec_team_image_media_id";`);
}
