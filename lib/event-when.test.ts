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

    expect(when.schedule.flatMap((entry) => entry.slots.map((slot) => slot.location))).toEqual([
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
    expect(when.schedule.every((entry) => entry.slots.every((slot) => slot.location === null))).toBe(true);
  });

  it("treats a whitespace-only location as no location", () => {
    const when = formatEventWhen({
      ...base,
      location: "   ",
      extraDates: [{ date: day("2026-08-31"), startTime: at(16) }],
    });

    expect(when.locationLabel).toBeNull();
    expect(when.schedule.every((entry) => entry.slots.every((slot) => slot.location === null))).toBe(true);
  });

  it("does not lend the event's end time to a day that set only a start", () => {
    // 4:30 PM start inheriting a 3:00 PM finish printed "4:30 PM – 3:00 PM".
    const when = formatEventWhen({
      ...base,
      extraDates: [{ date: day("2026-08-31"), startTime: at(16, 30) }],
    });

    expect(when.schedule.flatMap((entry) => entry.slots.map((slot) => slot.time))).toEqual([
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

    expect(when.schedule.flatMap((entry) => entry.slots.map((slot) => slot.time))).toEqual([
      "12:00 PM – 3:00 PM",
      "1:00 PM – 2:00 PM",
    ]);
  });

  it("keeps two sittings on one day as one day with two times", () => {
    // A workshop run in the morning and again in the afternoon. Previously the
    // second row was dropped for sharing a calendar day.
    const when = formatEventWhen({
      date: "2026-08-30T00:00:00.000Z",
      endTime: at(14),
      extraDates: [
        { date: day("2026-08-30"), startTime: at(14, 30), endTime: at(16) },
      ],
    });

    expect(when.dateLabel).toBe("Sunday, August 30, 2026");
    expect(when.schedule).toEqual([
      {
        day: "August 30",
        slots: [
          { time: "12:00 PM – 2:00 PM", location: null },
          { time: "2:30 PM – 4:00 PM", location: null },
        ],
      },
    ]);
  });

  it("names a two-sitting day once in a run of days", () => {
    const when = formatEventWhen({
      ...base,
      extraDates: [
        { date: day("2026-08-30"), startTime: at(16), endTime: at(17) },
        { date: day("2026-08-31") },
      ],
    });

    // Not "August 30, 30 & 31" — the day list is built from distinct days.
    expect(when.dateLabel).toBe("August 30 & 31, 2026");
    expect(when.schedule.map((entry) => entry.day)).toEqual([
      "August 30",
      "August 31",
    ]);
    expect(when.schedule[0].slots).toHaveLength(2);
  });

  it("still collapses a row that repeats a day at the very same hours", () => {
    const when = formatEventWhen({
      ...base,
      extraDates: [{ date: day("2026-08-30") }],
    });

    expect(when.dateLabel).toBe("Sunday, August 30, 2026");
    expect(when.schedule).toEqual([]);
  });

  it("orders two sittings on one day by when they start", () => {
    const when = formatEventWhen({
      date: "2026-08-30T00:00:00.000Z",
      endTime: at(14),
      extraDates: [
        { date: day("2026-08-30"), startTime: at(9), endTime: at(11) },
      ],
    });

    expect(
      when.schedule[0].slots.map((slot) => slot.time),
    ).toEqual(["9:00 AM – 11:00 AM", "12:00 PM – 2:00 PM"]);
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
