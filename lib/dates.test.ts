import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  formatDateLong,
  formatDateShort,
  formatDateWithTime,
  formatEventWhen,
} from "./utils.ts";

/**
 * Every assertion here runs with the process timezone forced to UTC, which is
 * what Vercel gives the production server. Without that the tests would pass on
 * a New Zealand laptop while the deployed site rendered something else — which
 * is exactly the bug this file exists to pin down.
 */
const originalTimeZone = process.env.TZ;

beforeAll(() => {
  process.env.TZ = "UTC";
});

afterAll(() => {
  process.env.TZ = originalTimeZone;
});

// Midday in Auckland during daylight saving. Stored as UTC by Payload, which
// takes the time as typed in the admin, i.e. in the editor's own timezone.
const MIDDAY_NZ = "2026-01-15T23:00:00.000Z";

describe("date formatting on a UTC server", () => {
  it("shows an Auckland event time in Auckland time, not the server's", () => {
    expect(formatDateWithTime(MIDDAY_NZ)).toBe(
      "Friday, January 16, 2026 at 12:00 PM",
    );
  });

  // 1am on the 16th in Auckland is still the 15th in UTC, so a server
  // formatting in its own zone reports the event a day early.
  const EARLY_HOURS_NZ = "2026-01-15T12:00:00.000Z";

  it("keeps an early-hours event on the day it actually happens", () => {
    expect(formatDateLong(EARLY_HOURS_NZ)).toBe("January 16, 2026");
  });

  it("keeps the short card date on that same day", () => {
    expect(formatDateShort(EARLY_HOURS_NZ)).toBe("1/16/2026");
  });
});

/*
 * Instants below are UTC, annotated with the Auckland wall-clock time an
 * editor would have typed to produce them. Extra days are stored by the
 * day-only picker as midnight, hence the T12:00Z values in September.
 */
const SEP_3_NOON = "2026-09-03T00:00:00.000Z";
const SEP_3_3PM = "2026-09-03T03:00:00.000Z";
const SEP_4 = "2026-09-03T12:00:00.000Z";
const SEP_4_9AM = "2026-09-03T21:00:00.000Z";
const SEP_4_10AM = "2026-09-03T22:00:00.000Z";
const SEP_5 = "2026-09-04T12:00:00.000Z";

describe("formatEventWhen", () => {
  it("puts the weekday on a one-day event, which has room for it", () => {
    const when = formatEventWhen({ date: SEP_3_NOON, endTime: SEP_3_3PM });

    expect(when.dateLabel).toBe("Thursday, September 3, 2026");
    expect(when.timeLabel).toBe("12:00 PM – 3:00 PM");
  });

  it("shows a lone start time when no end time was given", () => {
    expect(formatEventWhen({ date: SEP_3_NOON }).timeLabel).toBe("12:00 PM");
  });

  it("joins two days and says the hours cover both", () => {
    const when = formatEventWhen({
      date: SEP_3_NOON,
      endTime: SEP_3_3PM,
      extraDates: [{ date: SEP_4 }],
    });

    expect(when.dateLabel).toBe("September 3 & 4, 2026");
    expect(when.timeLabel).toBe("12:00 PM – 3:00 PM, both days");
    expect(when.schedule).toEqual([]);
  });

  it("says 'all days' once there are more than two", () => {
    const when = formatEventWhen({
      date: SEP_3_NOON,
      endTime: SEP_3_3PM,
      extraDates: [{ date: SEP_4 }, { date: SEP_5 }],
    });

    expect(when.dateLabel).toBe("September 3, 4 & 5, 2026");
    expect(when.timeLabel).toBe("12:00 PM – 3:00 PM, all days");
  });

  it("lists each day separately when the hours differ", () => {
    const when = formatEventWhen({
      date: SEP_3_NOON,
      endTime: SEP_3_3PM,
      extraDates: [{ date: SEP_4, startTime: SEP_4_9AM, endTime: SEP_4_10AM }],
    });

    expect(when.dateLabel).toBe("September 3 & 4, 2026");
    expect(when.timeLabel).toBeNull();
    expect(when.schedule).toEqual([
      { day: "September 3", time: "12:00 PM – 3:00 PM" },
      { day: "September 4", time: "9:00 AM – 10:00 AM" },
    ]);
  });

  it("repeats the month when days straddle one", () => {
    const when = formatEventWhen({
      // Noon on 30 September, then 1 October.
      date: "2026-09-29T23:00:00.000Z",
      extraDates: [{ date: "2026-09-30T11:00:00.000Z" }],
    });

    expect(when.dateLabel).toBe("September 30 & October 1, 2026");
  });

  it("gives each date its own year when they straddle one", () => {
    const when = formatEventWhen({
      // Noon on 31 December 2026, then 1 January 2027.
      date: "2026-12-30T23:00:00.000Z",
      extraDates: [{ date: "2026-12-31T11:00:00.000Z" }],
    });

    expect(when.dateLabel).toBe("December 31, 2026 & January 1, 2027");
  });

  it("sorts extra days that were entered out of order", () => {
    const when = formatEventWhen({
      date: SEP_3_NOON,
      extraDates: [{ date: SEP_5 }, { date: SEP_4 }],
    });

    expect(when.dateLabel).toBe("September 3, 4 & 5, 2026");
  });

  it("ignores an extra day whose date never got filled in", () => {
    const when = formatEventWhen({
      date: SEP_3_NOON,
      endTime: SEP_3_3PM,
      extraDates: [{ date: "" }],
    });

    expect(when.dateLabel).toBe("Thursday, September 3, 2026");
    expect(when.timeLabel).toBe("12:00 PM – 3:00 PM");
  });
});
