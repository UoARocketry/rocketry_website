import { describe, expect, it } from "vitest";
import { toInitials } from "./initials.ts";

describe("toInitials", () => {
  it("takes the first and last name", () => {
    expect(toInitials("Rowan Martin")).toBe("RM");
    expect(toInitials("Daniel Lobo")).toBe("DL");
  });

  it("skips middle names rather than running to three letters", () => {
    expect(toInitials("Kevil Anand Paul")).toBe("KP");
  });

  it("handles a single name", () => {
    expect(toInitials("Prince")).toBe("P");
  });

  it("ignores extra whitespace", () => {
    expect(toInitials("   Rowan    Martin  ")).toBe("RM");
  });

  it("treats a hyphenated surname as one name", () => {
    expect(toInitials("Mary Smith-Jones")).toBe("MS");
  });

  it("uppercases lowercase input", () => {
    expect(toInitials("rowan martin")).toBe("RM");
  });

  it("falls back to a neutral glyph when there is nothing usable", () => {
    expect(toInitials("")).toBe("?");
    expect(toInitials("   ")).toBe("?");
  });

  it("keeps the first letter of a non-latin name intact", () => {
    expect(toInitials("Ana García")).toBe("AG");
  });
});
