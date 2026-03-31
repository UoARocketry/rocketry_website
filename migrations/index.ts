import * as migration_20260331_044531_initial from './20260331_044531_initial';

export const migrations = [
  {
    up: migration_20260331_044531_initial.up,
    down: migration_20260331_044531_initial.down,
    name: '20260331_044531_initial'
  },
];
