import * as migration_20260331_044531_initial from "./20260331_044531_initial";
import * as migration_20260331_184019_add_media_upload_relations from "./20260331_184019_add_media_upload_relations";
import * as migration_20260401_000001_add_media_prefix from "./20260401_000001_add_media_prefix";

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
];
