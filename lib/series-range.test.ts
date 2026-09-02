import { beforeAll, describe, expect, it } from "vitest";
import {
  endOfNzDay,
  findNextSessionIndex,
  getSeriesEndDate,
  isEventUpcoming,
} from "./utils.ts";

/** A day-only value as the CMS stores it, re-anchored the way site-data does. */
const day = (iso: string) => `${iso}T00:00:00.000Z`;

describe("getSeriesEndDate", () => {
  it("returns null for a series with no sessions", () => {
    expect(getSeriesEndDate([])).toBeNull();
  });

  it("uses the last session when none carry extra days", () => {
    expect(
      getSeriesEndDate([
        { date: "2026-05-11T05:00:00.000Z" },
        { date: "2026-09-18T21:00:00.000Z" },
      ]),
    ).toBe("2026-09-18T21:00:00.000Z");
  });

  it("follows a final session past its own date onto its extra days", () => {
    // The Level 1 series: Launch day on the 19th, also running the 20th.
    expect(
      getSeriesEndDate([
        { date: "2026-05-11T05:00:00.000Z" },
        {
          date: "2026-09-18T21:00:00.000Z",
          extraDates: [{ date: day("2026-09-20") }],
        },
      ]),
    ).toBe(day("2026-09-20"));
  });

  it("finds the latest day even when sessions are out of order", () => {
    expect(
      getSeriesEndDate([
        {
          date: "2026-08-31T00:00:00.000Z",
          extraDates: [{ date: day("2026-09-03") }],
        },
        { date: "2026-08-20T12:00:00.000Z" },
      ]),
    ).toBe(day("2026-09-03"));
  });

  it("ignores rows whose date will not parse", () => {
    expect(
      getSeriesEndDate([
        { date: "2026-05-11T05:00:00.000Z" },
        { date: "not a date" },
      ]),
    ).toBe("2026-05-11T05:00:00.000Z");
  });
});

describe("endOfNzDay", () => {
  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  it("ends a day-only date at the following NZ midnight", () => {
    // NZST is UTC+12, so 20 Sep ends at 2026-09-20T12:00Z.
    expect(endOfNzDay(day("2026-09-20"))).toBe(
      Date.parse("2026-09-20T12:00:00.000Z"),
    );
  });

  it("follows the clocks through the NZDT changeover", () => {
    // NZDT starts 27 Sep 2026, so 28 Sep ends an hour earlier in UTC terms.
    expect(endOfNzDay(day("2026-09-28"))).toBe(
      Date.parse("2026-09-28T11:00:00.000Z"),
    );
  });

  it("carries a timed event through to the end of its own day", () => {
    // 9am on the 19th NZ, which is still the 18th in UTC.
    expect(endOfNzDay("2026-09-18T21:00:00.000Z")).toBe(
      Date.parse("2026-09-19T12:00:00.000Z"),
    );
  });

  it("returns null for an unparseable value", () => {
    expect(endOfNzDay("not a date")).toBeNull();
  });
});

describe("day boundaries in event state", () => {
  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  it("keeps a one-off event upcoming while its day is still running", () => {
    const justStarted = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(isEventUpcoming({ date: justStarted })).toBe(true);
  });

  it("retires an event once its day is over", () => {
    const lastWeek = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isEventUpcoming({ date: lastWeek })).toBe(false);
  });

  it("keeps a session current through its final extra day", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const index = findNextSessionIndex([
      {
        date: yesterday.toISOString(),
        extraDates: [{ date: tomorrow.toISOString() }],
      },
    ]);

    expect(index).toBe(0);
  });
});
