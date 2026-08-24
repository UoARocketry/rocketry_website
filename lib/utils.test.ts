import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  findNextSessionIndex,
  formatEventCardDate,
  formatEventSessionsLabel,
  isEventUpcoming,
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
  // Asserts which session was picked without hard-coding a formatted date,
  // which would otherwise depend on the machine's timezone.
  const expectDate = (actual: string, source: string) => {
    expect(actual).toBe(new Date(source).toLocaleDateString("en-US"));
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
    ).toBe("2 of 3 left");
  });

  it("reports the total once the series has finished", () => {
    expect(
      formatEventSessionsLabel({
        date: past(1).date,
        sessions: [past(2), past(10)],
      }),
    ).toBe("2 sessions");
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
