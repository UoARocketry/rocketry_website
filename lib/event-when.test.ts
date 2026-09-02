import { beforeAll, describe, expect, it } from "vitest";
import { formatEventWhen } from "./utils.ts";

const day = (iso: string) => `${iso}T00:00:00.000Z`;
/** A time-only value: only its clock part, read in Auckland, means anything. */
const at = (hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, 1, hour - 12, minute)).toISOString();

describe("formatEventWhen fallbacks", () => {
  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  // Noon on 30 August in Auckland, which is midnight UTC the same day.
  const base = {
    date: "2026-08-30T00:00:00.000Z",
    endTime: at(15),
    location: "W&D Rooms (405-122)",
  };

  it("falls back to the event location when a day's own is emptied", () => {
    // Clearing a text field in Payload stores "", not null, so `?? fallback`
    // never fired and the day silently lost its location entirely. Mirrors the
    // Epoxy session: one day moved elsewhere, one day's override cleared.
    const when = formatEventWhen({
      ...base,
      extraDates: [
        { date: day("2026-08-31"), startTime: at(15), location: "" },
        { date: day("2026-09-01"), startTime: at(15), location: "Test" },
      ],
    });

    expect(when.schedule.map((entry) => entry.location)).toEqual([
      "W&D Rooms (405-122)",
      "W&D Rooms (405-122)",
      "Test",
    ]);
  });

  it("states one location once when every day agrees after the fallback", () => {
    const when = formatEventWhen({
      ...base,
      extraDates: [
        { date: day("2026-08-31"), startTime: at(15), location: "" },
      ],
    });

    expect(when.locationLabel).toBe("W&D Rooms (405-122), both days");
    expect(when.schedule.every((entry) => entry.location === null)).toBe(true);
  });

  it("treats a whitespace-only location as no location", () => {
    const when = formatEventWhen({
      ...base,
      location: "   ",
      extraDates: [{ date: day("2026-08-31"), startTime: at(16) }],
    });

    expect(when.locationLabel).toBeNull();
    expect(when.schedule.every((entry) => entry.location === null)).toBe(true);
  });

  it("does not lend the event's end time to a day that set only a start", () => {
    // 4:30 PM start inheriting a 3:00 PM finish printed "4:30 PM – 3:00 PM".
    const when = formatEventWhen({
      ...base,
      extraDates: [{ date: day("2026-08-31"), startTime: at(16, 30) }],
    });

    expect(when.schedule.map((entry) => entry.time)).toEqual([
      "12:00 PM – 3:00 PM",
      "4:30 PM",
    ]);
  });

  it("inherits both hours when a day states neither", () => {
    const when = formatEventWhen({
      ...base,
      extraDates: [{ date: day("2026-08-31") }],
    });

    expect(when.timeLabel).toBe("12:00 PM – 3:00 PM, both days");
    expect(when.schedule).toEqual([]);
  });

  it("uses a day's own pair when it states both", () => {
    const when = formatEventWhen({
      ...base,
      extraDates: [
        { date: day("2026-08-31"), startTime: at(13), endTime: at(14) },
      ],
    });

    expect(when.schedule.map((entry) => entry.time)).toEqual([
      "12:00 PM – 3:00 PM",
      "1:00 PM – 2:00 PM",
    ]);
  });

  it("returns an empty label for an event with no date at all", () => {
    const when = formatEventWhen({ date: "" });

    expect(when).toEqual({
      dateLabel: "",
      timeLabel: null,
      locationLabel: null,
      schedule: [],
    });
  });
});
