import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * These tests guard the *wiring*, not the helper.
 *
 * lib/env.ts has always refused to fall back to the committed dev secret at
 * production runtime, and lib/env.test.ts has always covered that. The guard
 * was nonetheless inert for months because payload.config.ts re-implemented
 * the lookup inline and simply defaulted to the literal. A unit test on the
 * helper cannot catch that class of regression, so assert on the config.
 */
// Importing the whole Payload config pulls in every collection and plugin, so
// a cold import runs to several seconds. Vitest's 5s default is not enough
// once the suite is running files in parallel.
const CONFIG_IMPORT_TIMEOUT_MS = 30_000;

describe("payload.config secret wiring", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadConfig() {
    vi.resetModules();
    return import("./payload.config.ts");
  }

  it("refuses to build a config at production runtime without PAYLOAD_SECRET", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("PAYLOAD_SECRET", "");

    await expect(loadConfig()).rejects.toThrow(/PAYLOAD_SECRET is required/i);
  }, CONFIG_IMPORT_TIMEOUT_MS);

  it("still builds during the production build phase without PAYLOAD_SECRET", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    vi.stubEnv("PAYLOAD_SECRET", "");

    await expect(loadConfig()).resolves.toBeDefined();
  }, CONFIG_IMPORT_TIMEOUT_MS);

  it("builds at production runtime when PAYLOAD_SECRET is set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("PAYLOAD_SECRET", "a-real-production-secret");

    await expect(loadConfig()).resolves.toBeDefined();
  }, CONFIG_IMPORT_TIMEOUT_MS);

  it("never ships the committed dev fallback as the production secret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("PAYLOAD_SECRET", "a-real-production-secret");

    const { default: config } = await loadConfig();
    const resolved = await config;

    expect(resolved.secret).toBe("a-real-production-secret");
    expect(resolved.secret).not.toMatch(/dev-only-secret/);
  }, CONFIG_IMPORT_TIMEOUT_MS);
});
