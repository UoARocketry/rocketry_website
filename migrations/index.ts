import * as migration_20260331_044531_initial from "./20260331_044531_initial";
import * as migration_20260331_184019_add_media_upload_relations from "./20260331_184019_add_media_upload_relations";
import * as migration_20260401_000001_add_media_prefix from "./20260401_000001_add_media_prefix";
import * as migration_20260401_010000_enable_payload_rls from "./20260401_010000_enable_payload_rls";
import * as migration_20260819_120000_remove_events_is_past from "./20260819_120000_remove_events_is_past";
import * as migration_20260819_130000_add_event_tags_and_sponsor_tiers from "./20260819_130000_add_event_tags_and_sponsor_tiers";
import * as migration_20260819_140000_add_rocket_gallery from "./20260819_140000_add_rocket_gallery";
import * as migration_20260819_150000_add_locked_documents_rels_new_collections from "./20260819_150000_add_locked_documents_rels_new_collections";
import * as migration_20260819_160000_add_site_settings_social_links from "./20260819_160000_add_site_settings_social_links";
import * as migration_20260825_120000_add_event_sessions from "./20260825_120000_add_event_sessions";
import * as migration_20260825_130000_add_exec_photo_position from "./20260825_130000_add_exec_photo_position";
import * as migration_20260825_140000_add_site_settings_usage_limits from "./20260825_140000_add_site_settings_usage_limits";
import * as migration_20260825_150000_add_site_settings_contact_email from "./20260825_150000_add_site_settings_contact_email";
import * as migration_20260826_120000_add_rocket_featured from "./20260826_120000_add_rocket_featured";
import * as migration_20260826_130000_add_rocket_specs from "./20260826_130000_add_rocket_specs";
import * as migration_20260901_120000_fix_version_orphans from "./20260901_120000_fix_version_orphans";
import * as migration_20260901_130000_add_user_roles_and_trash from "./20260901_130000_add_user_roles_and_trash";
import * as migration_20260901_140000_rocket_gallery_to_rels from "./20260901_140000_rocket_gallery_to_rels";
import * as migration_20260901_150000_drop_rocket_gallery_arrays from "./20260901_150000_drop_rocket_gallery_arrays";
import * as migration_20260902_120000_add_image_positions from "./20260902_120000_add_image_positions";
import * as migration_20260902_130000_add_event_end_times_and_extra_dates from "./20260902_130000_add_event_end_times_and_extra_dates";

export const migrations = [
  {
    up: migration_20260331_044531_initial.up,
    down: migration_20260331_044531_initial.down,
    name: "20260331_044531_initial",
  },
  {
    up: migration_20260331_184019_add_media_upload_relations.up,
    down: migration_20260331_184019_add_media_upload_relations.down,
    name: "20260331_184019_add_media_upload_relations",
  },
  {
    up: migration_20260401_000001_add_media_prefix.up,
    down: migration_20260401_000001_add_media_prefix.down,
    name: "20260401_000001_add_media_prefix",
  },
  {
    up: migration_20260401_010000_enable_payload_rls.up,
    down: migration_20260401_010000_enable_payload_rls.down,
    name: "20260401_010000_enable_payload_rls",
  },
  {
    up: migration_20260819_120000_remove_events_is_past.up,
    down: migration_20260819_120000_remove_events_is_past.down,
    name: "20260819_120000_remove_events_is_past",
  },
  {
    up: migration_20260819_130000_add_event_tags_and_sponsor_tiers.up,
    down: migration_20260819_130000_add_event_tags_and_sponsor_tiers.down,
    name: "20260819_130000_add_event_tags_and_sponsor_tiers",
  },
  {
    up: migration_20260819_140000_add_rocket_gallery.up,
    down: migration_20260819_140000_add_rocket_gallery.down,
    name: "20260819_140000_add_rocket_gallery",
  },
  {
    up: migration_20260819_150000_add_locked_documents_rels_new_collections.up,
    down: migration_20260819_150000_add_locked_documents_rels_new_collections.down,
    name: "20260819_150000_add_locked_documents_rels_new_collections",
  },
  {
    up: migration_20260819_160000_add_site_settings_social_links.up,
    down: migration_20260819_160000_add_site_settings_social_links.down,
    name: "20260819_160000_add_site_settings_social_links",
  },
  {
    up: migration_20260825_120000_add_event_sessions.up,
    down: migration_20260825_120000_add_event_sessions.down,
    name: "20260825_120000_add_event_sessions",
  },
  {
    up: migration_20260825_130000_add_exec_photo_position.up,
    down: migration_20260825_130000_add_exec_photo_position.down,
    name: "20260825_130000_add_exec_photo_position",
  },
  {
    up: migration_20260825_140000_add_site_settings_usage_limits.up,
    down: migration_20260825_140000_add_site_settings_usage_limits.down,
    name: "20260825_140000_add_site_settings_usage_limits",
  },
  {
    up: migration_20260825_150000_add_site_settings_contact_email.up,
    down: migration_20260825_150000_add_site_settings_contact_email.down,
    name: "20260825_150000_add_site_settings_contact_email",
  },
  {
    up: migration_20260826_120000_add_rocket_featured.up,
    down: migration_20260826_120000_add_rocket_featured.down,
    name: "20260826_120000_add_rocket_featured",
  },
  {
    up: migration_20260826_130000_add_rocket_specs.up,
    down: migration_20260826_130000_add_rocket_specs.down,
    name: "20260826_130000_add_rocket_specs",
  },
  {
    up: migration_20260901_120000_fix_version_orphans.up,
    down: migration_20260901_120000_fix_version_orphans.down,
    name: "20260901_120000_fix_version_orphans",
  },
  {
    up: migration_20260901_130000_add_user_roles_and_trash.up,
    down: migration_20260901_130000_add_user_roles_and_trash.down,
    name: "20260901_130000_add_user_roles_and_trash",
  },
  {
    up: migration_20260901_140000_rocket_gallery_to_rels.up,
    down: migration_20260901_140000_rocket_gallery_to_rels.down,
    name: "20260901_140000_rocket_gallery_to_rels",
  },
  {
    up: migration_20260901_150000_drop_rocket_gallery_arrays.up,
    down: migration_20260901_150000_drop_rocket_gallery_arrays.down,
    name: "20260901_150000_drop_rocket_gallery_arrays",
  },
  {
    up: migration_20260902_120000_add_image_positions.up,
    down: migration_20260902_120000_add_image_positions.down,
    name: "20260902_120000_add_image_positions",
  },
  {
    up: migration_20260902_130000_add_event_end_times_and_extra_dates.up,
    down: migration_20260902_130000_add_event_end_times_and_extra_dates.down,
    name: "20260902_130000_add_event_end_times_and_extra_dates",
  },
];
