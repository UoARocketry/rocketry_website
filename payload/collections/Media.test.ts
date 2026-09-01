import { describe, expect, it } from "vitest";
import { assertDisplayableImage, resolveMediaPrefix } from "./Media.ts";

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

describe("assertDisplayableImage", () => {
  it("rejects an iPhone HEIC photo, which no browser but Safari can show", () => {
    expect(() =>
      assertDisplayableImage({ mimetype: "image/heic", name: "IMG_4821.HEIC" }),
    ).toThrow(/HEIC/i);
  });

  it("rejects HEIF too, the same format under its other name", () => {
    expect(() =>
      assertDisplayableImage({ mimetype: "image/heif", name: "photo.heif" }),
    ).toThrow(/HEIC/i);
  });

  it("catches a HEIC whose browser reported no useful type", () => {
    // Some browsers hand over an empty or generic type for an unknown format,
    // so the extension is the only signal left.
    expect(() =>
      assertDisplayableImage({
        mimetype: "application/octet-stream",
        name: "IMG_4821.heic",
      }),
    ).toThrow(/HEIC/i);
  });

  it("allows the formats the site actually displays", () => {
    expect(() =>
      assertDisplayableImage({ mimetype: "image/jpeg", name: "photo.jpg" }),
    ).not.toThrow();
    expect(() =>
      assertDisplayableImage({ mimetype: "image/png", name: "logo.png" }),
    ).not.toThrow();
    expect(() =>
      assertDisplayableImage({ mimetype: "image/webp", name: "shot.webp" }),
    ).not.toThrow();
  });

  it("does nothing when there is no file, e.g. editing the alt text", () => {
    expect(() => assertDisplayableImage(undefined)).not.toThrow();
  });
});
