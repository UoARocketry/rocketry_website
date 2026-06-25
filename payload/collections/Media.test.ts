import { describe, expect, it } from "vitest";
import { resolveMediaPrefix } from "./Media.ts";

describe("resolveMediaPrefix", () => {
  it("defaults to 'media' when empty/missing", () => {
    expect(resolveMediaPrefix(undefined)).toBe("media");
    expect(resolveMediaPrefix("")).toBe("media");
    expect(resolveMediaPrefix("   ")).toBe("media");
  });
  it("keeps a provided non-empty prefix (trimmed)", () => {
    expect(resolveMediaPrefix("avatars")).toBe("avatars");
    expect(resolveMediaPrefix("  logos ")).toBe("logos");
  });
});
