import { describe, expect, it } from "vitest";
import { resolveSafeReturnPath } from "./safe-redirect.ts";

describe("resolveSafeReturnPath", () => {
  it("keeps an ordinary internal path", () => {
    expect(resolveSafeReturnPath("/rockets")).toBe("/rockets");
    expect(resolveSafeReturnPath("/events/launch-day")).toBe(
      "/events/launch-day",
    );
  });

  it("preserves the query string and fragment", () => {
    expect(resolveSafeReturnPath("/events?tag=launch#top")).toBe(
      "/events?tag=launch#top",
    );
  });

  it("falls back to the home page for missing or relative input", () => {
    expect(resolveSafeReturnPath(null)).toBe("/");
    expect(resolveSafeReturnPath(undefined)).toBe("/");
    expect(resolveSafeReturnPath("")).toBe("/");
    expect(resolveSafeReturnPath("rockets")).toBe("/");
  });

  // Each of these was verified to redirect off-site before the fix. The
  // backslash and tab cases were reproduced in a real browser, which followed
  // them to an external origin.
  describe("off-site escapes", () => {
    const escapes = [
      ["protocol-relative", "//evil.com"],
      ["backslash normalised to a slash", "/\\evil.com"],
      ["backslash then slash", "/\\/evil.com"],
      ["tab stripped by the parser", "/\t/evil.com"],
      ["newline stripped by the parser", "/\n/evil.com"],
      ["carriage return stripped by the parser", "/\r/evil.com"],
      ["many leading slashes", "////evil.com"],
      ["absolute url", "https://evil.com"],
      ["scheme-only", "javascript:alert(1)"],
    ] as const;

    for (const [label, input] of escapes) {
      it(`rejects ${label}`, () => {
        expect(resolveSafeReturnPath(input)).toBe("/");
      });
    }
  });

  it("never returns a value that could be read as protocol-relative", () => {
    const inputs = [
      "/\\evil.com",
      "//evil.com",
      "/\t/evil.com",
      "/rockets",
      "/events?a=1",
    ];

    for (const input of inputs) {
      const result = resolveSafeReturnPath(input);
      expect(result.startsWith("/")).toBe(true);
      expect(result.startsWith("//")).toBe(false);
      expect(result).not.toContain("\\");
    }
  });
});
