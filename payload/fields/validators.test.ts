import { describe, expect, it } from "vitest";
import {
  normalizeUrlValue,
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

describe("normalizeUrlValue", () => {
  it("adds the scheme to a bare link, the way Instagram shows one", () => {
    expect(normalizeUrlValue("tr.ee/DKA8yiAigc")).toBe(
      "https://tr.ee/DKA8yiAigc",
    );
  });

  it("adds the scheme to a bare domain", () => {
    expect(normalizeUrlValue("www.example.com")).toBe(
      "https://www.example.com",
    );
    expect(normalizeUrlValue("example.co.nz")).toBe("https://example.co.nz");
  });

  it("leaves an existing scheme alone rather than rewriting intent", () => {
    expect(normalizeUrlValue("http://example.com")).toBe("http://example.com");
    expect(normalizeUrlValue("https://example.com")).toBe(
      "https://example.com",
    );
    expect(normalizeUrlValue("mailto:someone@example.com")).toBe(
      "mailto:someone@example.com",
    );
  });

  it("strips the whitespace and quotes that come with a copied link", () => {
    expect(normalizeUrlValue("  https://example.com  ")).toBe(
      "https://example.com",
    );
    expect(normalizeUrlValue("“https://example.com”")).toBe(
      "https://example.com",
    );
    expect(normalizeUrlValue('"tr.ee/abc"')).toBe("https://tr.ee/abc");
  });

  it("leaves prose alone so validation can still reject it", () => {
    // Prepending here would turn a mistake into a plausible-looking link.
    expect(normalizeUrlValue("Sign up in our bio")).toBe("Sign up in our bio");
    expect(normalizeUrlValue("localhost")).toBe("localhost");
  });

  it("leaves empty and non-string values untouched", () => {
    expect(normalizeUrlValue("")).toBe("");
    expect(normalizeUrlValue("   ")).toBe("   ");
    expect(normalizeUrlValue(null)).toBeNull();
    expect(normalizeUrlValue(undefined)).toBeUndefined();
  });

  it("produces something the validator then accepts", () => {
    expect(validateOptionalUrl(normalizeUrlValue("tr.ee/DKA8yiAigc"))).toBe(
      true,
    );
  });
});
