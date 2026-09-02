import { beforeAll, describe, expect, it } from "vitest";
import { findDuplicateDays } from "./duplicate-days.ts";

/** A day-only value as the picker stores it: noon UTC of that day. */
const day = (iso: string) => `${iso}T12:00:00.000Z`;
/** Noon in Auckland on the given day, which is midnight UTC the same day. */
const nzNoon = (iso: string) => `${iso}T00:00:00.000Z`;
/** A time-only value: only its Auckland clock reading matters. */
const at = (hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, 1, hour - 12, minute)).toISOString();

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

  it("catches an extra day repeating the event's own date with no hours", () => {
    // With no hours of its own it inherits the event's, so it is the same
    // sitting again rather than a second one.
    const errors = findDuplicateDays({
      date: nzNoon("2026-09-03"),
      extraDates: [{ date: day("2026-09-03") }],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("3 September 2026");
    expect(errors[0]).toContain("own start and end time");
  });

  it("allows a second sitting on the same day at different hours", () => {
    expect(
      findDuplicateDays({
        date: nzNoon("2026-09-03"),
        endTime: at(14),
        extraDates: [
          { date: day("2026-09-03"), startTime: at(15), endTime: at(17) },
        ],
      }),
    ).toEqual([]);
  });

  it("rejects two sittings on one day at exactly the same hours", () => {
    const errors = findDuplicateDays({
      date: nzNoon("2026-09-03"),
      extraDates: [
        { date: day("2026-09-03"), startTime: at(15), endTime: at(17) },
        { date: day("2026-09-03"), startTime: at(15), endTime: at(17) },
      ],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("twice on 3 September 2026 at the same time");
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
