import { describe, expect, it } from "vitest";
import {
  DEFAULT_FRAMING,
  formatPhotoFraming,
  parsePhotoFraming,
  photoFramingStyle,
} from "./photo-position.ts";

describe("parsePhotoFraming", () => {
  it("parses the full shorthand", () => {
    expect(parsePhotoFraming("25% 75% 1.5")).toEqual({
      x: 25,
      y: 75,
      zoom: 1.5,
    });
  });

  it("accepts legacy values written before zoom existed", () => {
    expect(parsePhotoFraming("25% 75%")).toEqual({ x: 25, y: 75, zoom: 1 });
  });

  it("falls back to centred defaults for empty or malformed values", () => {
    expect(parsePhotoFraming(undefined)).toEqual(DEFAULT_FRAMING);
    expect(parsePhotoFraming("")).toEqual(DEFAULT_FRAMING);
    expect(parsePhotoFraming("centre")).toEqual(DEFAULT_FRAMING);
    expect(parsePhotoFraming(42)).toEqual(DEFAULT_FRAMING);
  });

  it("clamps out-of-range values", () => {
    expect(parsePhotoFraming("-20% 300% 99")).toEqual({
      x: 0,
      y: 100,
      zoom: 3,
    });
  });
});

describe("formatPhotoFraming", () => {
  it("round-trips through parse", () => {
    const framing = { x: 30, y: 70, zoom: 1.25 };
    expect(parsePhotoFraming(formatPhotoFraming(framing))).toEqual(framing);
  });

  it("rounds percentages to whole numbers", () => {
    expect(formatPhotoFraming({ x: 33.7, y: 66.2, zoom: 1 })).toBe("34% 66% 1");
  });
});

describe("photoFramingStyle", () => {
  it("collapses to a plain cover crop at zoom 1", () => {
    const style = photoFramingStyle({ x: 20, y: 80, zoom: 1 });
    expect(style.width).toBe("100%");
    expect(style.height).toBe("100%");
    expect(style.left).toBe("0%");
    expect(style.top).toBe("0%");
    expect(style.objectPosition).toBe("20% 80%");
  });

  it("centres the image when zoomed with centred focus", () => {
    const style = photoFramingStyle({ x: 50, y: 50, zoom: 2 });
    // A 200%-wide box offset by -50% leaves equal overflow on both sides.
    expect(style.width).toBe("200%");
    expect(style.left).toBe("-50%");
    expect(style.top).toBe("-50%");
  });

  it("pins to the left/top edges at zero focus", () => {
    const style = photoFramingStyle({ x: 0, y: 0, zoom: 2 });
    expect(style.left).toBe("0%");
    expect(style.top).toBe("0%");
  });

  it("pins to the right/bottom edges at full focus", () => {
    const style = photoFramingStyle({ x: 100, y: 100, zoom: 2 });
    // 200% wide, shifted a full container width left => right edge visible.
    expect(style.left).toBe("-100%");
    expect(style.top).toBe("-100%");
  });

  it("neutralises next/image fill's right and bottom insets", () => {
    const style = photoFramingStyle(DEFAULT_FRAMING);
    expect(style.right).toBe("auto");
    expect(style.bottom).toBe("auto");
    expect(style.position).toBe("absolute");
  });
});
