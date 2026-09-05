import { unstable_cache } from "next/cache";

/**
 * How many per-argument loaders to keep alive.
 *
 * Some of these maps are keyed by values taken straight out of the URL
 * (`/rockets/<slug>`), and an entry is created before we know whether the slug
 * matches anything, so an unbounded map would grow for every distinct path a
 * crawler or scanner tries and never shrink for the life of the server
 * instance.
 *
 * The cap only trades memory for a rebuilt closure. Next keys its own cache on
 * the key parts passed to `unstable_cache`, so a loader that has been evicted
 * still resolves from the same cache entry rather than going to the database.
 */
export const DEFAULT_LOADER_CACHE_LIMIT = 256;

export type CachedByArgOptions<K extends string | number, T> = {
  /** Namespace for the cache key, so two loaders cannot collide on one value. */
  keyPrefix: string;
  /** Seconds before Next revalidates the entry. */
  revalidate: number;
  /** Revalidation tags for this particular argument value. */
  tags: (value: K) => string[];
  load: (value: K) => Promise<T>;
  /** Exposed for tests; production callers should take the default. */
  limit?: number;
};

/**
 * Memoises one `unstable_cache` loader per argument value, so a per-slug or
 * per-year query gets its own cache entry and its own revalidation tags, while
 * keeping the number of retained loaders bounded.
 */
export function createCachedByArg<K extends string | number, T>(
  options: CachedByArgOptions<K, T>,
) {
  const limit = options.limit ?? DEFAULT_LOADER_CACHE_LIMIT;
  const cache = new Map<K, () => Promise<T>>();

  return (value: K) => {
    let loader = cache.get(value);

    if (!loader) {
      loader = unstable_cache(
        () => options.load(value),
        [options.keyPrefix, String(value)],
        {
          revalidate: options.revalidate,
          tags: options.tags(value),
        },
      );

      if (cache.size >= limit) {
        // A Map iterates in insertion order, so the first key is the oldest.
        // Plain FIFO rather than true LRU: an eviction costs one rebuilt
        // closure, which does not justify tracking access order.
        const oldest = cache.keys().next();
        if (!oldest.done) {
          cache.delete(oldest.value);
        }
      }

      cache.set(value, loader);
    }

    return loader();
  };
}
