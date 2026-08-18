import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { getRocketBySlug, getEventBySlug } = vi.hoisted(() => ({
  getRocketBySlug: vi.fn(),
  getEventBySlug: vi.fn(),
}));

vi.mock("@/lib/site-data", () => ({
  getRocketBySlug,
  getEventBySlug,
}));

const { proxy } = await import("./proxy.ts");

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, "https://www.uoarocketry.com"));
}

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes through an existing rocket slug", async () => {
    getRocketBySlug.mockResolvedValueOnce({ id: 1, name: "Striker X" });

    const response = await proxy(makeRequest("/rockets/striker-x"));

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(getRocketBySlug).toHaveBeenCalledWith("striker-x");
  });

  it("rewrites to the not-found marker for a missing rocket slug", async () => {
    getRocketBySlug.mockResolvedValueOnce(null);

    const response = await proxy(makeRequest("/rockets/does-not-exist"));

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://www.uoarocketry.com/__not_found__",
    );
  });

  it("passes through an existing event slug", async () => {
    getEventBySlug.mockResolvedValueOnce({ id: 1, title: "Launch Day" });

    const response = await proxy(makeRequest("/events/launch-day"));

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(getEventBySlug).toHaveBeenCalledWith("launch-day");
  });

  it("rewrites to the not-found marker for a missing event slug", async () => {
    getEventBySlug.mockResolvedValueOnce(null);

    const response = await proxy(makeRequest("/events/does-not-exist"));

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://www.uoarocketry.com/__not_found__",
    );
  });

  it("decodes URL-encoded slugs before checking existence", async () => {
    getRocketBySlug.mockResolvedValueOnce({ id: 1, name: "Test" });

    await proxy(makeRequest("/rockets/striker%20x"));

    expect(getRocketBySlug).toHaveBeenCalledWith("striker x");
  });

  it("fails open when the existence check throws", async () => {
    getRocketBySlug.mockRejectedValueOnce(new Error("connect ECONNREFUSED"));

    const response = await proxy(makeRequest("/rockets/striker-x"));

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("ignores paths that aren't rocket or event detail pages", async () => {
    const response = await proxy(makeRequest("/rockets"));

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(getRocketBySlug).not.toHaveBeenCalled();
    expect(getEventBySlug).not.toHaveBeenCalled();
  });
});
