import { describe, expect, it } from "vitest";
import type { Access } from "payload";
import {
  ADMIN_ROLE,
  EDITOR_ROLE,
  isAdmin,
  isAdminOrSelf,
  isLoggedIn,
  isPublicRead,
  isPublicReadPublished,
} from "./policies.ts";

type AccessArgs = Parameters<Access>[0];

function args(user: unknown): AccessArgs {
  return { req: { user } } as unknown as AccessArgs;
}

const ANONYMOUS = args(null);
const EDITOR = args({ id: 7, role: EDITOR_ROLE });
const ADMIN = args({ id: 1, role: ADMIN_ROLE });

describe("isPublicRead", () => {
  it("allows anyone", () => {
    expect(isPublicRead(ANONYMOUS)).toBe(true);
    expect(isPublicRead(EDITOR)).toBe(true);
  });
});

describe("isPublicReadPublished", () => {
  // The bug this guards: Payload generates a public REST API from every
  // collection, and a never-published document sits in the main table with
  // _status 'draft'. With a plain `() => true` read policy, an anonymous
  // GET /api/rockets returned unpublished documents in full.
  it("restricts anonymous readers to published documents", () => {
    expect(isPublicReadPublished(ANONYMOUS)).toEqual({
      _status: { equals: "published" },
    });
  });

  it("does not return an unrestricted true for anonymous readers", () => {
    expect(isPublicReadPublished(ANONYMOUS)).not.toBe(true);
  });

  it("lets a signed-in editor see drafts, which the admin UI needs", () => {
    expect(isPublicReadPublished(EDITOR)).toBe(true);
  });

  it("lets an admin see drafts", () => {
    expect(isPublicReadPublished(ADMIN)).toBe(true);
  });
});

describe("isLoggedIn", () => {
  it("rejects anonymous and accepts any signed-in user", () => {
    expect(isLoggedIn(ANONYMOUS)).toBe(false);
    expect(isLoggedIn(EDITOR)).toBe(true);
  });
});

describe("isAdmin", () => {
  it("accepts only the admin role", () => {
    expect(isAdmin(ANONYMOUS)).toBe(false);
    expect(isAdmin(EDITOR)).toBe(false);
    expect(isAdmin(ADMIN)).toBe(true);
  });
});

describe("isAdminOrSelf", () => {
  it("gives an admin everything", () => {
    expect(isAdminOrSelf(ADMIN)).toBe(true);
  });

  it("scopes an editor to their own record", () => {
    expect(isAdminOrSelf(EDITOR)).toEqual({ id: { equals: 7 } });
  });

  it("rejects anonymous", () => {
    expect(isAdminOrSelf(ANONYMOUS)).toBe(false);
  });
});
