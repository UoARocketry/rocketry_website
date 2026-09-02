import { beforeAll, describe, expect, it } from "vitest";
import { fromDayInputValue, toDayInputValue } from "./day-date.ts";

describe("day-only date conversion", () => {
  // The whole point of this module is that the answer does not depend on where
  // it runs, so the suite pins a timezone that is not Auckland and not UTC.
  beforeAll(() => {
    process.env.TZ = "America/New_York";
  });

  it("anchors a picked day at noon UTC", () => {
    expect(fromDayInputValue("2026-09-20")).toBe("2026-09-20T12:00:00.000Z");
  });

  it("reads a stored value back as the day it stands for", () => {
    expect(toDayInputValue("2026-09-20T12:00:00.000Z")).toBe("2026-09-20");
  });

  it("round-trips every day of a DST changeover weekend", () => {
    for (const day of [
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
      "2026-04-04",
      "2026-04-05",
      "2026-12-31",
      "2027-01-01",
    ]) {
      expect(toDayInputValue(fromDayInputValue(day))).toBe(day);
    }
  });

  it("pads single-digit months and days", () => {
    expect(fromDayInputValue("2026-01-05")).toBe("2026-01-05T12:00:00.000Z");
    expect(toDayInputValue("2026-01-05T12:00:00.000Z")).toBe("2026-01-05");
  });

  it("treats an empty or unparseable value as no date", () => {
    for (const value of [null, undefined, "", "not a date"]) {
      expect(toDayInputValue(value)).toBe("");
    }
    for (const value of [null, undefined, "", "20/09/2026", "2026-9-2"]) {
      expect(fromDayInputValue(value)).toBeNull();
    }
  });

  it("reads values already stored by the old picker unchanged", () => {
    // What Payload's own dayOnly picker wrote: noon UTC of the chosen day.
    expect(toDayInputValue("2026-09-19T12:00:00.000Z")).toBe("2026-09-19");
    expect(toDayInputValue("2026-09-04T12:00:00.000Z")).toBe("2026-09-04");
  });
});
