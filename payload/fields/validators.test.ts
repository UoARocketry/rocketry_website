import { describe, expect, it } from "vitest";
import {
  validateOptionalUrl,
  validateRequiredUrl,
} from "./validators.ts";

describe("validateOptionalUrl", () => {
  it("passes when empty (optional)", () => {
    expect(validateOptionalUrl("")).toBe(true);
    expect(validateOptionalUrl(null)).toBe(true);
  });
  it("passes for http(s) URLs", () => {
    expect(validateOptionalUrl("https://example.com")).toBe(true);
    expect(validateOptionalUrl("http://example.com")).toBe(true);
  });
  it("rejects non-http(s) and garbage", () => {
    expect(validateOptionalUrl("ftp://example.com")).toContain("valid");
    expect(validateOptionalUrl("not a url")).toContain("valid");
  });
});

describe("validateRequiredUrl", () => {
  it("rejects empty with a required message", () => {
    expect(validateRequiredUrl("")).toContain("required");
  });
  it("passes for https", () => {
    expect(validateRequiredUrl("https://example.com")).toBe(true);
  });
});
