import { beforeAll, describe, expect, it } from "vitest";
import { createEndTimeValidate } from "./validators.ts";

/** A time-only field stores a real instant; only its clock part is meaningful. */
const at = (hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, 1, hour, minute)).toISOString();

describe("createEndTimeValidate", () => {
  // Deliberately not Auckland: the comparison must read NZ clock times even
  // when the server does not, which is how the site runs on Vercel.
  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  const validate = createEndTimeValidate("startTime");
  const check = (startTime: unknown, end: unknown) =>
    validate(end, { siblingData: { startTime } });

  it("rejects an end time before the start", () => {
    // The pair that reached the live site: 1:30 PM – 12:30 PM.
    expect(check(at(1, 30), at(0, 30))).toBe(
      "The end time must be after the start time.",
    );
  });

  it("rejects an end time equal to the start", () => {
    expect(check(at(3), at(3))).toBe(
      "The end time is the same as the start time.",
    );
  });

  it("accepts an end time after the start", () => {
    expect(check(at(0), at(3))).toBe(true);
  });

  it("compares NZ clock times, not the stored instants", () => {
    // 21:00Z is 9am the next day in Auckland, 23:00Z is 11am. Compared as
    // instants the first is earlier; compared as clock times it still is,
    // but the pair below only reads correctly in Auckland.
    expect(check(at(21), at(23))).toBe(true);
    expect(check(at(23), at(21))).toBe(
      "The end time must be after the start time.",
    );
  });

  it("accepts a blank end time, which is optional everywhere", () => {
    for (const value of [null, undefined, ""]) {
      expect(check(at(1), value)).toBe(true);
    }
  });

  it("accepts a blank start, which inherits the parent's hours", () => {
    for (const value of [null, undefined, ""]) {
      expect(check(value, at(3))).toBe(true);
    }
  });

  it("guards a session against its own start date field", () => {
    const againstDate = createEndTimeValidate("date");
    expect(againstDate(at(0, 30), { siblingData: { date: at(1, 30) } })).toBe(
      "The end time must be after the start time.",
    );
    expect(againstDate(at(3), { siblingData: { date: at(1) } })).toBe(true);
  });

  it("ignores an unparseable value rather than blocking the save", () => {
    expect(check("not a date", at(3))).toBe(true);
    expect(check(at(1), "not a date")).toBe(true);
  });
});
