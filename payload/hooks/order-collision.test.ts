import { describe, expect, it } from "vitest";
import { resolveOrder } from "./order-collision.ts";

describe("resolveOrder", () => {
  it("pushes the occupant down when a new row claims its position", () => {
    const rows = [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
      { id: 3, order: 3 },
      { id: 99, order: 1 },
    ];

    expect(resolveOrder(rows, 99, 1)).toEqual([
      { id: 1, order: 2 },
      { id: 2, order: 3 },
      { id: 3, order: 4 },
    ]);
  });

  it("heals a pre-existing duplicate, the real Kevil/Daniel case", () => {
    // Both live execs sit at order 1. Publishing either one must produce a
    // contiguous sequence rather than leaving the tie unresolved.
    const rows = [
      { id: 28, order: 1 },
      { id: 30, order: 1 },
    ];

    expect(resolveOrder(rows, 30, 1)).toEqual([{ id: 28, order: 2 }]);
  });

  it("closes gaps left by deleted rows", () => {
    const rows = [
      { id: 1, order: 1 },
      { id: 2, order: 5 },
      { id: 3, order: 9 },
    ];

    expect(resolveOrder(rows, 1, 1)).toEqual([
      { id: 2, order: 2 },
      { id: 3, order: 3 },
    ]);
  });

  it("returns nothing when the sequence is already correct", () => {
    const rows = [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
      { id: 3, order: 3 },
    ];

    expect(resolveOrder(rows, 2, 2)).toEqual([]);
  });

  it("moves a row down the list without disturbing rows above it", () => {
    const rows = [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
      { id: 3, order: 3 },
      { id: 4, order: 4 },
    ];

    // Row 1 moves to position 3: rows 2 and 3 shift up, row 4 stays put.
    expect(resolveOrder(rows, 1, 3)).toEqual([
      { id: 2, order: 1 },
      { id: 3, order: 2 },
      { id: 1, order: 3 },
    ]);
  });

  it("clamps a target above the row count to the end of the list", () => {
    const rows = [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
    ];

    expect(resolveOrder(rows, 1, 99)).toEqual([
      { id: 2, order: 1 },
      { id: 1, order: 2 },
    ]);
  });

  it("clamps a zero or negative target to the front of the list", () => {
    const rows = [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
    ];

    expect(resolveOrder(rows, 2, 0)).toEqual([
      { id: 2, order: 1 },
      { id: 1, order: 2 },
    ]);
  });

  it("breaks ties by id so the result is stable across runs", () => {
    const rows = [
      { id: 7, order: 1 },
      { id: 3, order: 1 },
      { id: 5, order: 1 },
    ];

    // Moved row takes position 1; the rest keep ascending-id order behind it.
    expect(resolveOrder(rows, 5, 1)).toEqual([
      { id: 3, order: 2 },
      { id: 7, order: 3 },
    ]);
  });

  it("handles the moved row not yet being present in the group", () => {
    // A freshly created row may not appear in the queried set yet.
    const rows = [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
    ];

    expect(resolveOrder(rows, 42, 1)).toEqual([
      { id: 1, order: 2 },
      { id: 2, order: 3 },
    ]);
  });

  it("renumbers a lone row down to position 1", () => {
    // Gap-closing applies to the moved row itself: a group of one is always 1.
    expect(resolveOrder([{ id: 1, order: 4 }], 1, 4)).toEqual([
      { id: 1, order: 1 },
    ]);
  });

  it("accepts string ids", () => {
    const rows = [
      { id: "a", order: 1 },
      { id: "b", order: 2 },
    ];

    expect(resolveOrder(rows, "b", 1)).toEqual([
      { id: "b", order: 1 },
      { id: "a", order: 2 },
    ]);
  });
});
