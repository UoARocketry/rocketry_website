import { describe, expect, it } from "vitest";
import { isValidSlug, slugify } from "./slug.ts";

describe("slugify", () => {
  it("lowercases and hyphenates a normal title", () => {
    expect(slugify("Rocket Launch 2026")).toBe("rocket-launch-2026");
  });

  it("strips punctuation rather than encoding it", () => {
    expect(slugify("Level 1: Build Workshop!")).toBe("level-1-build-workshop");
  });

  it("collapses runs of separators into a single hyphen", () => {
    expect(slugify("Aurora   --  Mk II")).toBe("aurora-mk-ii");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --Launch Day--  ")).toBe("launch-day");
  });

  it("folds accented characters to their base letters", () => {
    expect(slugify("Café Décollage")).toBe("cafe-decollage");
  });

  it("handles ampersands as a word so titles stay readable", () => {
    expect(slugify("Design & Build")).toBe("design-and-build");
  });

  it("returns an empty string when nothing usable remains", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("")).toBe("");
  });

  it("is idempotent, so re-running it never changes a settled slug", () => {
    const once = slugify("Aurora Mk II");
    expect(slugify(once)).toBe(once);
  });
});

describe("isValidSlug", () => {
  it("accepts lowercase hyphenated values", () => {
    expect(isValidSlug("rocket-launch-2026")).toBe(true);
    expect(isValidSlug("aurora")).toBe(true);
  });

  it("rejects the mistakes a committee member will actually make", () => {
    expect(isValidSlug("Rocket Launch 2026")).toBe(false);
    expect(isValidSlug("Rocket-Launch")).toBe(false);
    expect(isValidSlug("rocket_launch")).toBe(false);
    expect(isValidSlug("rocket--launch")).toBe(false);
    expect(isValidSlug("-rocket")).toBe(false);
    expect(isValidSlug("rocket-")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
});
