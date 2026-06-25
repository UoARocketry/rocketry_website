import { describe, expect, it } from "vitest";
import {
  buildAllowedOrigins,
  isProductionRuntime,
  resolveDatabaseUrl,
  resolvePayloadSecret,
  resolveServerUrl,
} from "@/lib/env";

describe("isProductionRuntime", () => {
  it("is false in development", () => {
    expect(isProductionRuntime({ NODE_ENV: "development" })).toBe(false);
  });
  it("is false during a production build phase", () => {
    expect(
      isProductionRuntime({
        NODE_ENV: "production",
        NEXT_PHASE: "phase-production-build",
      }),
    ).toBe(false);
  });
  it("is true at production runtime", () => {
    expect(isProductionRuntime({ NODE_ENV: "production" })).toBe(true);
  });
});

describe("resolveDatabaseUrl", () => {
  it("prefers DIRECT_URL", () => {
    expect(
      resolveDatabaseUrl({ DIRECT_URL: "a", DATABASE_URL: "b" }),
    ).toBe("a");
  });
  it("throws when neither is set", () => {
    expect(() => resolveDatabaseUrl({})).toThrow(/database/i);
  });
});

describe("resolvePayloadSecret", () => {
  it("returns the configured secret", () => {
    expect(resolvePayloadSecret({ PAYLOAD_SECRET: "s3cret" })).toBe("s3cret");
  });
  it("returns a dev default when unset in development", () => {
    expect(resolvePayloadSecret({ NODE_ENV: "development" })).toMatch(/dev/i);
  });
  it("throws at production runtime when unset", () => {
    expect(() => resolvePayloadSecret({ NODE_ENV: "production" })).toThrow(
      /PAYLOAD_SECRET/,
    );
  });
  it("allows the dev default during a production build", () => {
    expect(
      resolvePayloadSecret({
        NODE_ENV: "production",
        NEXT_PHASE: "phase-production-build",
      }),
    ).toMatch(/dev/i);
  });
});

describe("buildAllowedOrigins", () => {
  it("includes SERVER_URL without trailing slash", () => {
    expect(
      buildAllowedOrigins({ NODE_ENV: "production", SERVER_URL: "https://x.com/" }),
    ).toEqual(["https://x.com"]);
  });
  it("adds localhost in development", () => {
    expect(buildAllowedOrigins({ NODE_ENV: "development" })).toContain(
      "http://localhost:3000",
    );
  });
});

describe("resolveServerUrl", () => {
  it("returns undefined when unset", () => {
    expect(resolveServerUrl({})).toBeUndefined();
  });
});
