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
];
