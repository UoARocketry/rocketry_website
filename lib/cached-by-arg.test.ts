import { beforeEach, describe, expect, it, vi } from "vitest";

// Stand in for Next's cache wrapper. Returning the loader unchanged lets the
// test count how often a *new* cached loader was constructed, which is the
// behaviour this module is responsible for.
const unstableCacheSpy = vi.fn(
  (...args: [fn: () => unknown, keyParts: string[], opts: unknown]) =>
    args[0] as () => Promise<unknown>,
);

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown, keyParts: string[], opts: unknown) =>
    unstableCacheSpy(fn, keyParts, opts),
}));

const { createCachedByArg, DEFAULT_LOADER_CACHE_LIMIT } = await import(
  "./cached-by-arg.ts"
);

describe("createCachedByArg", () => {
  beforeEach(() => {
    unstableCacheSpy.mockClear();
  });

  function build(limit?: number) {
    const load = vi.fn(async (value: string) => `loaded:${value}`);
    const loader = createCachedByArg<string, string>({
      keyPrefix: "thing-by-slug",
      revalidate: 300,
      tags: (value) => ["things", `thing:${value}`],
      load,
      limit,
    });
    return { loader, load };
  }

  it("returns the loaded value", async () => {
    const { loader } = build();
    await expect(loader("falcon")).resolves.toBe("loaded:falcon");
  });

  it("builds one cached loader per distinct argument", async () => {
    const { loader } = build();

    await loader("falcon");
    await loader("atlas");

    expect(unstableCacheSpy).toHaveBeenCalledTimes(2);
  });

  it("reuses the cached loader for a repeated argument", async () => {
    const { loader } = build();

    await loader("falcon");
    await loader("falcon");
    await loader("falcon");

    expect(unstableCacheSpy).toHaveBeenCalledTimes(1);
  });

  it("namespaces the cache key and tags per argument", async () => {
    const { loader } = build();

    await loader("falcon");

    expect(unstableCacheSpy).toHaveBeenCalledWith(
      expect.any(Function),
      ["thing-by-slug", "falcon"],
      { revalidate: 300, tags: ["things", "thing:falcon"] },
    );
  });

  it("stringifies numeric keys so the cache key stays stable", async () => {
    const load = vi.fn(async (value: number) => value * 2);
    const loader = createCachedByArg<number, number>({
      keyPrefix: "exec-team",
      revalidate: 300,
      tags: (year) => [`exec-year:${year}`],
      load,
    });

    await loader(2026);

    expect(unstableCacheSpy).toHaveBeenCalledWith(
      expect.any(Function),
      ["exec-team", "2026"],
      { revalidate: 300, tags: ["exec-year:2026"] },
    );
  });

  // The reason this module exists: slugs come from the URL, so an unbounded
  // map grows for every distinct path anyone tries.
  it("stops retaining loaders once the limit is reached", async () => {
    const { loader } = build(3);

    await loader("a");
    await loader("b");
    await loader("c");
    expect(unstableCacheSpy).toHaveBeenCalledTimes(3);

    // Fourth distinct key evicts the oldest ("a") rather than growing.
    await loader("d");
    expect(unstableCacheSpy).toHaveBeenCalledTimes(4);

    // "a" was evicted, so it has to be rebuilt.
    await loader("a");
    expect(unstableCacheSpy).toHaveBeenCalledTimes(5);

    // "d" is still resident, so it is not rebuilt.
    await loader("d");
    expect(unstableCacheSpy).toHaveBeenCalledTimes(5);
  });

  it("survives far more distinct keys than the limit", async () => {
    const { loader } = build(4);

    for (let i = 0; i < 500; i += 1) {
      await expect(loader(`scan-${i}`)).resolves.toBe(`loaded:scan-${i}`);
    }

    expect(unstableCacheSpy).toHaveBeenCalledTimes(500);
  });

  it("defaults to a bounded limit", () => {
    expect(DEFAULT_LOADER_CACHE_LIMIT).toBeGreaterThan(0);
    expect(Number.isFinite(DEFAULT_LOADER_CACHE_LIMIT)).toBe(true);
  });
});
