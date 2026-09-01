import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  findNextSessionIndex,
  formatEventCardDate,
  formatEventSessionsLabel,
  getRocketStatus,
  isEventUpcoming,
  sortRockets,
} from "./utils.ts";

const NOW = new Date("2026-06-15T12:00:00.000Z");

const past = (day: number) => ({
  title: `Past ${day}`,
  date: `2026-06-${String(day).padStart(2, "0")}T12:00:00.000Z`,
});
const future = (day: number) => ({
  title: `Future ${day}`,
  date: `2026-07-${String(day).padStart(2, "0")}T12:00:00.000Z`,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("isEventUpcoming", () => {
  it("uses the event date when there are no sessions", () => {
    expect(isEventUpcoming({ date: future(1).date })).toBe(true);
    expect(isEventUpcoming({ date: past(1).date })).toBe(false);
  });

  it("treats an empty sessions array the same as no sessions", () => {
    expect(isEventUpcoming({ date: future(1).date, sessions: [] })).toBe(true);
  });

  it("stays upcoming while any session is still to run", () => {
    // The series' own date has passed, but sessions remain.
    expect(
      isEventUpcoming({
        date: past(1).date,
        sessions: [past(2), past(10), future(1)],
      }),
    ).toBe(true);
  });

  it("is past once every session has run", () => {
    expect(
      isEventUpcoming({ date: past(1).date, sessions: [past(2), past(10)] }),
    ).toBe(false);
  });

  it("ignores unparseable session dates", () => {
    expect(
      isEventUpcoming({
        date: past(1).date,
        sessions: [{ title: "Broken", date: "not-a-date" }],
      }),
    ).toBe(false);
  });

  it("returns false for an unparseable event date", () => {
    expect(isEventUpcoming({ date: "not-a-date" })).toBe(false);
  });

  it("stays upcoming while a later day of a multi-day event is still to come", () => {
    expect(
      isEventUpcoming({
        date: past(1).date,
        extraDates: [{ date: future(1).date }],
      }),
    ).toBe(true);
  });

  it("keeps the final day upcoming until that day is over", () => {
    // Extra days are stored by a day-only picker, so the value is midnight.
    // Read literally that makes an event stale from the moment its last day
    // begins, which is precisely when people are still looking it up.
    expect(
      isEventUpcoming({
        date: past(1).date,
        extraDates: [{ date: new Date(NOW).toISOString() }],
      }),
    ).toBe(true);
  });

  it("is past once the last day has fully run", () => {
    expect(
      isEventUpcoming({
        date: past(10).date,
        extraDates: [{ date: past(2).date }],
      }),
    ).toBe(false);
  });
});

describe("findNextSessionIndex", () => {
  it("finds the first session still to run", () => {
    expect(findNextSessionIndex([past(2), past(10), future(1)])).toBe(2);
  });

  it("returns -1 when the series has finished", () => {
    expect(findNextSessionIndex([past(2), past(10)])).toBe(-1);
  });

  it("returns -1 for an empty list", () => {
    expect(findNextSessionIndex([])).toBe(-1);
  });
});

describe("formatEventCardDate", () => {
  // Asserts which session was picked without hard-coding a formatted date.
  // The timezone is pinned to the one the site renders in, so this says the
  // same thing on a New Zealand laptop and on a UTC build machine.
  const expectDate = (actual: string, source: string) => {
    expect(actual).toBe(
      new Date(source).toLocaleDateString("en-US", {
        timeZone: "Pacific/Auckland",
      }),
    );
  };

  it("falls back to the event date when there are no sessions", () => {
    expectDate(formatEventCardDate({ date: future(1).date }), future(1).date);
  });

  it("shows the next session still to run", () => {
    expectDate(
      formatEventCardDate({
        date: past(1).date,
        sessions: [past(2), future(1), future(8)],
      }),
      future(1).date,
    );
  });

  it("shows the final session once the series has finished", () => {
    expectDate(
      formatEventCardDate({
        date: past(1).date,
        sessions: [past(2), past(10)],
      }),
      past(10).date,
    );
  });

  it("sorts sessions by date rather than trusting array order", () => {
    expectDate(
      formatEventCardDate({
        date: past(1).date,
        sessions: [future(8), future(1)],
      }),
      future(1).date,
    );
  });

  it("shows the next day still to run of a multi-day event", () => {
    expectDate(
      formatEventCardDate({
        date: past(1).date,
        extraDates: [{ date: future(1).date }],
      }),
      future(1).date,
    );
  });

  it("shows the first day of a multi-day event that has not started", () => {
    expectDate(
      formatEventCardDate({
        date: future(1).date,
        extraDates: [{ date: future(8).date }],
      }),
      future(1).date,
    );
  });
});

describe("formatEventSessionsLabel", () => {
  it("returns null when there are no sessions", () => {
    expect(formatEventSessionsLabel({ date: future(1).date })).toBeNull();
  });

  it("returns null for a single session", () => {
    expect(
      formatEventSessionsLabel({ date: past(1).date, sessions: [future(1)] }),
    ).toBeNull();
  });

  it("counts sessions still to run, not the total, while any remain", () => {
    expect(
      formatEventSessionsLabel({
        date: past(1).date,
        sessions: [past(2), future(1), future(8)],
      }),
    ).toBe("Sessions: 2 of 3 left");
  });

  it("reports the total once the series has finished", () => {
    expect(
      formatEventSessionsLabel({
        date: past(1).date,
        sessions: [past(2), past(10)],
      }),
    ).toBe("Sessions: 2 total");
  });

  it("ignores unparseable session dates", () => {
    expect(
      formatEventSessionsLabel({
        date: past(1).date,
        sessions: [future(1), { title: "Broken", date: "not-a-date" }],
      }),
    ).toBeNull();
  });
});

describe("getRocketStatus", () => {
  it("treats a missing launch date as still in development", () => {
    expect(getRocketStatus({})).toBe("in-development");
    expect(getRocketStatus({ launchedAt: null })).toBe("in-development");
    expect(getRocketStatus({ launchedAt: "" })).toBe("in-development");
  });

  it("treats an unparseable launch date as still in development", () => {
    expect(getRocketStatus({ launchedAt: "not-a-date" })).toBe(
      "in-development",
    );
  });

  it("distinguishes a booked future launch from one that has flown", () => {
    expect(getRocketStatus({ launchedAt: future(1).date })).toBe("scheduled");
    expect(getRocketStatus({ launchedAt: past(1).date })).toBe("launched");
  });

  it("counts a launch happening right now as still scheduled", () => {
    expect(getRocketStatus({ launchedAt: NOW.toISOString() })).toBe(
      "scheduled",
    );
  });
});

describe("sortRockets", () => {
  const rocket = (name: string, launchedAt?: string | null) => ({
    name,
    launchedAt: launchedAt ?? null,
  });

  it("orders scheduled, then in development, then launched", () => {
    const sorted = sortRockets([
      rocket("Flown", past(1).date),
      rocket("Undated"),
      rocket("Booked", future(1).date),
    ]);

    expect(sorted.map((r) => r.name)).toEqual(["Booked", "Undated", "Flown"]);
  });

  it("puts the soonest launch first among scheduled rockets", () => {
    const sorted = sortRockets([
      rocket("Later", future(20).date),
      rocket("Sooner", future(1).date),
    ]);

    expect(sorted.map((r) => r.name)).toEqual(["Sooner", "Later"]);
  });

  it("puts the most recent flight first among launched rockets", () => {
    const sorted = sortRockets([
      rocket("Older", past(1).date),
      rocket("Newer", past(10).date),
    ]);

    expect(sorted.map((r) => r.name)).toEqual(["Newer", "Older"]);
  });

  it("falls back to name order for undated rockets", () => {
    const sorted = sortRockets([rocket("Zeta"), rocket("Alpha")]);

    expect(sorted.map((r) => r.name)).toEqual(["Alpha", "Zeta"]);
  });

  it("does not mutate the input array", () => {
    const input = [rocket("Flown", past(1).date), rocket("Undated")];
    sortRockets(input);

    expect(input.map((r) => r.name)).toEqual(["Flown", "Undated"]);
  });

  it("keeps an undated rocket out of the top slot reserved for launches", () => {
    // Regression: sort: "-launchedAt" relied on Postgres' DESC default of
    // NULLS FIRST, which floated every undated rocket above the flown ones.
    const sorted = sortRockets([rocket("Undated"), rocket("Booked", future(1).date)]);

    expect(sorted[0].name).toBe("Booked");
  });
});
