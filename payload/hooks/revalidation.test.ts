import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTagMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("next/cache.js", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

const {
  getNumberField,
  getStringField,
  revalidateAboutContent,
  revalidateLayout,
  revalidatePaths,
  revalidateTags,
} = await import("./revalidation.ts");

describe("revalidateTags", () => {
  beforeEach(() => {
    revalidateTagMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("busts each tag with the max profile", () => {
    revalidateTags(["rockets", "rocket:falcon"]);

    expect(revalidateTagMock).toHaveBeenCalledTimes(2);
    expect(revalidateTagMock).toHaveBeenCalledWith("rockets", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith("rocket:falcon", "max");
  });

  it("skips null, undefined and blank entries", () => {
    revalidateTags([null, undefined, "", "   ", "rockets"]);

    expect(revalidateTagMock).toHaveBeenCalledTimes(1);
    expect(revalidateTagMock).toHaveBeenCalledWith("rockets", "max");
  });
});

// The reason the guard exists: Payload runs afterChange hooks inside the
// write's transaction, so an unguarded throw here rolls the content change
// back. A failed cache bust must never reject an editor's save.
describe("revalidation failure handling", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    revalidateTagMock.mockReset();
    revalidatePathMock.mockReset();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it("does not throw when revalidateTag throws", () => {
    revalidateTagMock.mockImplementation(() => {
      throw new Error("Invariant: static generation store missing");
    });

    expect(() => revalidateTags(["rockets"])).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it("does not throw when revalidatePath throws", () => {
    revalidatePathMock.mockImplementation(() => {
      throw new Error("Invariant: static generation store missing");
    });

    expect(() => revalidatePaths(["/rockets"])).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it("keeps going after one tag fails, so later tags still bust", () => {
    revalidateTagMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    revalidateTags(["rockets", "events"]);

    expect(revalidateTagMock).toHaveBeenCalledTimes(2);
    expect(revalidateTagMock).toHaveBeenLastCalledWith("events", "max");
  });

  it("names the failing target in the warning", () => {
    revalidateTagMock.mockImplementation(() => {
      throw new Error("boom");
    });

    revalidateTags(["sponsors"]);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('tag "sponsors"'),
      "boom",
    );
  });
});

describe("revalidateLayout", () => {
  beforeEach(() => {
    revalidatePathMock.mockReset();
  });

  it("passes Next's layout argument", () => {
    revalidateLayout("/");

    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
  });

  it("does not throw when it fails", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    revalidatePathMock.mockImplementation(() => {
      throw new Error("boom");
    });

    expect(() => revalidateLayout("/")).not.toThrow();
    warnSpy.mockRestore();
  });
});

describe("revalidateAboutContent", () => {
  beforeEach(() => {
    revalidateTagMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("busts the about tag and path together", () => {
    revalidateAboutContent();

    expect(revalidateTagMock).toHaveBeenCalledWith("about", "max");
    expect(revalidatePathMock).toHaveBeenCalledWith("/about");
  });
});

describe("field readers", () => {
  it("reads non-empty strings only", () => {
    expect(getStringField({ slug: "falcon" }, "slug")).toBe("falcon");
    expect(getStringField({ slug: "  " }, "slug")).toBeNull();
    expect(getStringField(null, "slug")).toBeNull();
    expect(getStringField({ slug: 7 }, "slug")).toBeNull();
  });

  it("reads numbers, including numeric strings", () => {
    expect(getNumberField({ year: 2026 }, "year")).toBe(2026);
    expect(getNumberField({ year: "2026" }, "year")).toBe(2026);
    expect(getNumberField({ year: "nope" }, "year")).toBeNull();
    expect(getNumberField({ year: Number.NaN }, "year")).toBeNull();
    expect(getNumberField(null, "year")).toBeNull();
  });
});
