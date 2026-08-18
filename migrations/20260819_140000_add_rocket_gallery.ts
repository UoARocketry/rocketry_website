import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "rockets_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );
    CREATE TABLE "_rockets_v_version_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "_uuid" varchar
    );

    ALTER TABLE "rockets_gallery" ADD CONSTRAINT "rockets_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "rockets_gallery" ADD CONSTRAINT "rockets_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rockets"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_rockets_v_version_gallery" ADD CONSTRAINT "_rockets_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_rockets_v_version_gallery" ADD CONSTRAINT "_rockets_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_rockets_v"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "rockets_gallery_order_idx" ON "rockets_gallery" USING btree ("_order");
    CREATE INDEX "rockets_gallery_parent_id_idx" ON "rockets_gallery" USING btree ("_parent_id");
    CREATE INDEX "rockets_gallery_image_idx" ON "rockets_gallery" USING btree ("image_id");
    CREATE INDEX "_rockets_v_version_gallery_order_idx" ON "_rockets_v_version_gallery" USING btree ("_order");
    CREATE INDEX "_rockets_v_version_gallery_parent_id_idx" ON "_rockets_v_version_gallery" USING btree ("_parent_id");
    CREATE INDEX "_rockets_v_version_gallery_image_idx" ON "_rockets_v_version_gallery" USING btree ("image_id");

    ALTER TABLE "rockets_gallery" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "_rockets_v_version_gallery" ENABLE ROW LEVEL SECURITY;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "rockets_gallery" CASCADE;
    DROP TABLE "_rockets_v_version_gallery" CASCADE;
  `);
}
