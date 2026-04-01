import { sql } from "@payloadcms/db-postgres";
import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from "@payloadcms/drizzle/postgres";

export async function up({
	db,
}: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_rockets_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__rockets_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_executives_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__executives_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sponsors_tier" AS ENUM('GOLD', 'SILVER', 'BRONZE');
  CREATE TYPE "public"."enum_sponsors_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sponsors_v_version_tier" AS ENUM('GOLD', 'SILVER', 'BRONZE');
  CREATE TYPE "public"."enum__sponsors_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_what_we_do_variant" AS ENUM('background', 'surface');
  CREATE TYPE "public"."enum_what_we_do_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__what_we_do_v_version_variant" AS ENUM('background', 'surface');
  CREATE TYPE "public"."enum__what_we_do_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_journey_items_variant" AS ENUM('background', 'surface');
  CREATE TYPE "public"."enum_journey_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__journey_items_v_version_variant" AS ENUM('background', 'surface');
  CREATE TYPE "public"."enum__journey_items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_team_roles_variant" AS ENUM('background', 'surface');
  CREATE TYPE "public"."enum_team_roles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_roles_v_version_variant" AS ENUM('background', 'surface');
  CREATE TYPE "public"."enum__team_roles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_stats_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__stats_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"image" varchar,
  	"description" varchar,
  	"date" timestamp(3) with time zone,
  	"event_tag" varchar,
  	"signup_url" varchar,
  	"is_past" boolean DEFAULT false,
  	"location" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_image" varchar,
  	"version_description" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_event_tag" varchar,
  	"version_signup_url" varchar,
  	"version_is_past" boolean DEFAULT false,
  	"version_location" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "rockets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"image" varchar,
  	"description" varchar,
  	"launched_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_rockets_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_rockets_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_image" varchar,
  	"version_description" varchar,
  	"version_launched_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__rockets_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "executives" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"bio" varchar,
  	"photo" varchar,
  	"year" numeric,
  	"order" numeric DEFAULT 1,
  	"linkedin_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_executives_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_executives_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_role" varchar,
  	"version_bio" varchar,
  	"version_photo" varchar,
  	"version_year" numeric,
  	"version_order" numeric DEFAULT 1,
  	"version_linkedin_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__executives_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "sponsors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo" varchar,
  	"url" varchar,
  	"description" varchar,
  	"tier" "enum_sponsors_tier",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_sponsors_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_sponsors_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_logo" varchar,
  	"version_url" varchar,
  	"version_description" varchar,
  	"version_tier" "enum__sponsors_v_version_tier",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__sponsors_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "what_we_do" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"image" varchar,
  	"variant" "enum_what_we_do_variant",
  	"order" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_what_we_do_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_what_we_do_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_body" varchar,
  	"version_image" varchar,
  	"version_variant" "enum__what_we_do_v_version_variant",
  	"version_order" numeric DEFAULT 1,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__what_we_do_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "journey_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"image" varchar,
  	"variant" "enum_journey_items_variant",
  	"order" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_journey_items_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_journey_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_body" varchar,
  	"version_image" varchar,
  	"version_variant" "enum__journey_items_v_version_variant",
  	"version_order" numeric DEFAULT 1,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__journey_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "team_roles_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "team_roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"variant" "enum_team_roles_variant",
  	"order" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_roles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_team_roles_v_version_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_team_roles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_body" varchar,
  	"version_variant" "enum__team_roles_v_version_variant",
  	"version_order" numeric DEFAULT 1,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_roles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"order" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_stats_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_stats_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_value" varchar,
  	"version_label" varchar,
  	"version_order" numeric DEFAULT 1,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__stats_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"events_id" integer,
  	"rockets_id" integer,
  	"executives_id" integer,
  	"sponsors_id" integer,
  	"what_we_do_id" integer,
  	"journey_items_id" integer,
  	"team_roles_id" integer,
  	"stats_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_join_url" varchar,
  	"exec_team_image_url" varchar,
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_member_join_url" varchar,
  	"version_exec_team_image_url" varchar,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rockets_v" ADD CONSTRAINT "_rockets_v_parent_id_rockets_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rockets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_executives_v" ADD CONSTRAINT "_executives_v_parent_id_executives_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."executives"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sponsors_v" ADD CONSTRAINT "_sponsors_v_parent_id_sponsors_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sponsors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_what_we_do_v" ADD CONSTRAINT "_what_we_do_v_parent_id_what_we_do_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."what_we_do"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_journey_items_v" ADD CONSTRAINT "_journey_items_v_parent_id_journey_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."journey_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_roles_bullets" ADD CONSTRAINT "team_roles_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_roles_v_version_bullets" ADD CONSTRAINT "_team_roles_v_version_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_roles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_roles_v" ADD CONSTRAINT "_team_roles_v_parent_id_team_roles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stats_v" ADD CONSTRAINT "_stats_v_parent_id_stats_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stats"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rockets_fk" FOREIGN KEY ("rockets_id") REFERENCES "public"."rockets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_executives_fk" FOREIGN KEY ("executives_id") REFERENCES "public"."executives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sponsors_fk" FOREIGN KEY ("sponsors_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_what_we_do_fk" FOREIGN KEY ("what_we_do_id") REFERENCES "public"."what_we_do"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_journey_items_fk" FOREIGN KEY ("journey_items_id") REFERENCES "public"."journey_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_roles_fk" FOREIGN KEY ("team_roles_id") REFERENCES "public"."team_roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stats_fk" FOREIGN KEY ("stats_id") REFERENCES "public"."stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE UNIQUE INDEX "rockets_slug_idx" ON "rockets" USING btree ("slug");
  CREATE INDEX "rockets_updated_at_idx" ON "rockets" USING btree ("updated_at");
  CREATE INDEX "rockets_created_at_idx" ON "rockets" USING btree ("created_at");
  CREATE INDEX "rockets__status_idx" ON "rockets" USING btree ("_status");
  CREATE INDEX "_rockets_v_parent_idx" ON "_rockets_v" USING btree ("parent_id");
  CREATE INDEX "_rockets_v_version_version_slug_idx" ON "_rockets_v" USING btree ("version_slug");
  CREATE INDEX "_rockets_v_version_version_updated_at_idx" ON "_rockets_v" USING btree ("version_updated_at");
  CREATE INDEX "_rockets_v_version_version_created_at_idx" ON "_rockets_v" USING btree ("version_created_at");
  CREATE INDEX "_rockets_v_version_version__status_idx" ON "_rockets_v" USING btree ("version__status");
  CREATE INDEX "_rockets_v_created_at_idx" ON "_rockets_v" USING btree ("created_at");
  CREATE INDEX "_rockets_v_updated_at_idx" ON "_rockets_v" USING btree ("updated_at");
  CREATE INDEX "_rockets_v_latest_idx" ON "_rockets_v" USING btree ("latest");
  CREATE INDEX "executives_year_idx" ON "executives" USING btree ("year");
  CREATE INDEX "executives_updated_at_idx" ON "executives" USING btree ("updated_at");
  CREATE INDEX "executives_created_at_idx" ON "executives" USING btree ("created_at");
  CREATE INDEX "executives__status_idx" ON "executives" USING btree ("_status");
  CREATE INDEX "_executives_v_parent_idx" ON "_executives_v" USING btree ("parent_id");
  CREATE INDEX "_executives_v_version_version_year_idx" ON "_executives_v" USING btree ("version_year");
  CREATE INDEX "_executives_v_version_version_updated_at_idx" ON "_executives_v" USING btree ("version_updated_at");
  CREATE INDEX "_executives_v_version_version_created_at_idx" ON "_executives_v" USING btree ("version_created_at");
  CREATE INDEX "_executives_v_version_version__status_idx" ON "_executives_v" USING btree ("version__status");
  CREATE INDEX "_executives_v_created_at_idx" ON "_executives_v" USING btree ("created_at");
  CREATE INDEX "_executives_v_updated_at_idx" ON "_executives_v" USING btree ("updated_at");
  CREATE INDEX "_executives_v_latest_idx" ON "_executives_v" USING btree ("latest");
  CREATE UNIQUE INDEX "sponsors_name_idx" ON "sponsors" USING btree ("name");
  CREATE INDEX "sponsors_updated_at_idx" ON "sponsors" USING btree ("updated_at");
  CREATE INDEX "sponsors_created_at_idx" ON "sponsors" USING btree ("created_at");
  CREATE INDEX "sponsors__status_idx" ON "sponsors" USING btree ("_status");
  CREATE INDEX "_sponsors_v_parent_idx" ON "_sponsors_v" USING btree ("parent_id");
  CREATE INDEX "_sponsors_v_version_version_name_idx" ON "_sponsors_v" USING btree ("version_name");
  CREATE INDEX "_sponsors_v_version_version_updated_at_idx" ON "_sponsors_v" USING btree ("version_updated_at");
  CREATE INDEX "_sponsors_v_version_version_created_at_idx" ON "_sponsors_v" USING btree ("version_created_at");
  CREATE INDEX "_sponsors_v_version_version__status_idx" ON "_sponsors_v" USING btree ("version__status");
  CREATE INDEX "_sponsors_v_created_at_idx" ON "_sponsors_v" USING btree ("created_at");
  CREATE INDEX "_sponsors_v_updated_at_idx" ON "_sponsors_v" USING btree ("updated_at");
  CREATE INDEX "_sponsors_v_latest_idx" ON "_sponsors_v" USING btree ("latest");
  CREATE UNIQUE INDEX "what_we_do_title_idx" ON "what_we_do" USING btree ("title");
  CREATE INDEX "what_we_do_updated_at_idx" ON "what_we_do" USING btree ("updated_at");
  CREATE INDEX "what_we_do_created_at_idx" ON "what_we_do" USING btree ("created_at");
  CREATE INDEX "what_we_do__status_idx" ON "what_we_do" USING btree ("_status");
  CREATE INDEX "_what_we_do_v_parent_idx" ON "_what_we_do_v" USING btree ("parent_id");
  CREATE INDEX "_what_we_do_v_version_version_title_idx" ON "_what_we_do_v" USING btree ("version_title");
  CREATE INDEX "_what_we_do_v_version_version_updated_at_idx" ON "_what_we_do_v" USING btree ("version_updated_at");
  CREATE INDEX "_what_we_do_v_version_version_created_at_idx" ON "_what_we_do_v" USING btree ("version_created_at");
  CREATE INDEX "_what_we_do_v_version_version__status_idx" ON "_what_we_do_v" USING btree ("version__status");
  CREATE INDEX "_what_we_do_v_created_at_idx" ON "_what_we_do_v" USING btree ("created_at");
  CREATE INDEX "_what_we_do_v_updated_at_idx" ON "_what_we_do_v" USING btree ("updated_at");
  CREATE INDEX "_what_we_do_v_latest_idx" ON "_what_we_do_v" USING btree ("latest");
  CREATE UNIQUE INDEX "journey_items_title_idx" ON "journey_items" USING btree ("title");
  CREATE INDEX "journey_items_updated_at_idx" ON "journey_items" USING btree ("updated_at");
  CREATE INDEX "journey_items_created_at_idx" ON "journey_items" USING btree ("created_at");
  CREATE INDEX "journey_items__status_idx" ON "journey_items" USING btree ("_status");
  CREATE INDEX "_journey_items_v_parent_idx" ON "_journey_items_v" USING btree ("parent_id");
  CREATE INDEX "_journey_items_v_version_version_title_idx" ON "_journey_items_v" USING btree ("version_title");
  CREATE INDEX "_journey_items_v_version_version_updated_at_idx" ON "_journey_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_journey_items_v_version_version_created_at_idx" ON "_journey_items_v" USING btree ("version_created_at");
  CREATE INDEX "_journey_items_v_version_version__status_idx" ON "_journey_items_v" USING btree ("version__status");
  CREATE INDEX "_journey_items_v_created_at_idx" ON "_journey_items_v" USING btree ("created_at");
  CREATE INDEX "_journey_items_v_updated_at_idx" ON "_journey_items_v" USING btree ("updated_at");
  CREATE INDEX "_journey_items_v_latest_idx" ON "_journey_items_v" USING btree ("latest");
  CREATE INDEX "team_roles_bullets_order_idx" ON "team_roles_bullets" USING btree ("_order");
  CREATE INDEX "team_roles_bullets_parent_id_idx" ON "team_roles_bullets" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "team_roles_title_idx" ON "team_roles" USING btree ("title");
  CREATE INDEX "team_roles_updated_at_idx" ON "team_roles" USING btree ("updated_at");
  CREATE INDEX "team_roles_created_at_idx" ON "team_roles" USING btree ("created_at");
  CREATE INDEX "team_roles__status_idx" ON "team_roles" USING btree ("_status");
  CREATE INDEX "_team_roles_v_version_bullets_order_idx" ON "_team_roles_v_version_bullets" USING btree ("_order");
  CREATE INDEX "_team_roles_v_version_bullets_parent_id_idx" ON "_team_roles_v_version_bullets" USING btree ("_parent_id");
  CREATE INDEX "_team_roles_v_parent_idx" ON "_team_roles_v" USING btree ("parent_id");
  CREATE INDEX "_team_roles_v_version_version_title_idx" ON "_team_roles_v" USING btree ("version_title");
  CREATE INDEX "_team_roles_v_version_version_updated_at_idx" ON "_team_roles_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_roles_v_version_version_created_at_idx" ON "_team_roles_v" USING btree ("version_created_at");
  CREATE INDEX "_team_roles_v_version_version__status_idx" ON "_team_roles_v" USING btree ("version__status");
  CREATE INDEX "_team_roles_v_created_at_idx" ON "_team_roles_v" USING btree ("created_at");
  CREATE INDEX "_team_roles_v_updated_at_idx" ON "_team_roles_v" USING btree ("updated_at");
  CREATE INDEX "_team_roles_v_latest_idx" ON "_team_roles_v" USING btree ("latest");
  CREATE UNIQUE INDEX "stats_label_idx" ON "stats" USING btree ("label");
  CREATE INDEX "stats_updated_at_idx" ON "stats" USING btree ("updated_at");
  CREATE INDEX "stats_created_at_idx" ON "stats" USING btree ("created_at");
  CREATE INDEX "stats__status_idx" ON "stats" USING btree ("_status");
  CREATE INDEX "_stats_v_parent_idx" ON "_stats_v" USING btree ("parent_id");
  CREATE INDEX "_stats_v_version_version_label_idx" ON "_stats_v" USING btree ("version_label");
  CREATE INDEX "_stats_v_version_version_updated_at_idx" ON "_stats_v" USING btree ("version_updated_at");
  CREATE INDEX "_stats_v_version_version_created_at_idx" ON "_stats_v" USING btree ("version_created_at");
  CREATE INDEX "_stats_v_version_version__status_idx" ON "_stats_v" USING btree ("version__status");
  CREATE INDEX "_stats_v_created_at_idx" ON "_stats_v" USING btree ("created_at");
  CREATE INDEX "_stats_v_updated_at_idx" ON "_stats_v" USING btree ("updated_at");
  CREATE INDEX "_stats_v_latest_idx" ON "_stats_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_rockets_id_idx" ON "payload_locked_documents_rels" USING btree ("rockets_id");
  CREATE INDEX "payload_locked_documents_rels_executives_id_idx" ON "payload_locked_documents_rels" USING btree ("executives_id");
  CREATE INDEX "payload_locked_documents_rels_sponsors_id_idx" ON "payload_locked_documents_rels" USING btree ("sponsors_id");
  CREATE INDEX "payload_locked_documents_rels_what_we_do_id_idx" ON "payload_locked_documents_rels" USING btree ("what_we_do_id");
  CREATE INDEX "payload_locked_documents_rels_journey_items_id_idx" ON "payload_locked_documents_rels" USING btree ("journey_items_id");
  CREATE INDEX "payload_locked_documents_rels_team_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("team_roles_id");
  CREATE INDEX "payload_locked_documents_rels_stats_id_idx" ON "payload_locked_documents_rels" USING btree ("stats_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");`);
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Intentionally non-destructive for this project:
  // keep rollback as a no-op so legacy database tables are never removed by migration down.
  return;
}
