import { beforeAll, describe, expect, it } from "vitest";
import { findDuplicateDays } from "./duplicate-days.ts";

/** A day-only value as the picker stores it: noon UTC of that day. */
const day = (iso: string) => `${iso}T12:00:00.000Z`;
/** Noon in Auckland on the given day, which is midnight UTC the same day. */
const nzNoon = (iso: string) => `${iso}T00:00:00.000Z`;

describe("findDuplicateDays", () => {
  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  it("passes an event whose days are all different", () => {
    expect(
      findDuplicateDays({
        date: nzNoon("2026-09-03"),
        extraDates: [{ date: day("2026-09-04") }, { date: day("2026-09-05") }],
      }),
    ).toEqual([]);
  });

  it("catches an extra day repeating the event's own date", () => {
    // Silently dropped before, taking that day's hours and location with it.
    const errors = findDuplicateDays({
      date: nzNoon("2026-09-03"),
      extraDates: [{ date: day("2026-09-03") }],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("3 September 2026");
    expect(errors[0]).toContain("already");
  });

  it("catches one extra day repeating another", () => {
    const errors = findDuplicateDays({
      date: nzNoon("2026-09-03"),
      extraDates: [{ date: day("2026-09-04") }, { date: day("2026-09-04") }],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("4 September 2026");
  });

  it("compares an event's timed date on its Auckland day", () => {
    // 21:00Z is 9am on the 19th in Auckland, so an extra day on the 19th is a
    // duplicate even though the stored instant reads as the 18th in UTC.
    const errors = findDuplicateDays({
      date: "2026-09-18T21:00:00.000Z",
      extraDates: [{ date: day("2026-09-19") }],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("19 September 2026");
  });

  it("checks each session separately and names it", () => {
    const errors = findDuplicateDays({
      date: nzNoon("2026-03-27"),
      sessions: [
        {
          title: "Epoxy Assembly Workshops",
          date: nzNoon("2026-08-31"),
          extraDates: [{ date: day("2026-08-31") }],
        },
        {
          title: "Launch day",
          date: nzNoon("2026-09-19"),
          extraDates: [{ date: day("2026-09-20") }],
        },
      ],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("Epoxy Assembly Workshops");
    expect(errors[0]).toContain("31 August 2026");
  });

  it("lets two sessions share a day, which is normal", () => {
    // The 3D printing and laser cutting workshops genuinely run together.
    expect(
      findDuplicateDays({
        sessions: [
          { title: "3D Printing Workshop", date: nzNoon("2026-08-28") },
          { title: "Laser Cutting Workshop", date: nzNoon("2026-08-28") },
        ],
      }),
    ).toEqual([]);
  });

  it("ignores rows still being filled in", () => {
    expect(
      findDuplicateDays({
        date: null,
        extraDates: [{ date: null }, { date: "" }, { date: "not a date" }],
        sessions: [{ title: "", date: null, extraDates: null }],
      }),
    ).toEqual([]);
  });

  it("reports every clash rather than only the first", () => {
    const errors = findDuplicateDays({
      date: nzNoon("2026-09-03"),
      extraDates: [{ date: day("2026-09-03") }],
      sessions: [
        {
          title: "Launch day",
          date: nzNoon("2026-09-19"),
          extraDates: [{ date: day("2026-09-19") }],
        },
      ],
    });

    expect(errors).toHaveLength(2);
  });
});
