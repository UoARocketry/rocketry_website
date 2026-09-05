/** Throwaway origin used only to resolve a candidate path against. */
const INTERNAL_BASE = "http://internal.invalid";

/**
 * Narrows a caller-supplied `returnTo` to a path on this site, or `/`.
 *
 * A `startsWith("/") && !startsWith("//")` check is not sufficient. Browsers
 * follow the WHATWG URL rules when parsing a Location header: a backslash is
 * normalised to a forward slash, and tab, newline and carriage return are
 * stripped before parsing. So `/\evil.com` and `/<tab>/evil.com` both become
 * the protocol-relative `//evil.com` and navigate off-site. Both were confirmed
 * in a real browser against this route, landing on an external origin.
 *
 * Rather than blocklisting each spelling, resolve the value against a throwaway
 * origin and reject anything that escapes it, then rebuild the redirect from
 * the parsed path alone so nothing from the input survives verbatim.
 */
export function resolveSafeReturnPath(returnTo: string | null | undefined): string {
  if (typeof returnTo !== "string" || !returnTo.startsWith("/")) {
    return "/";
  }

  try {
    const resolved = new URL(returnTo, INTERNAL_BASE);

    if (resolved.origin !== INTERNAL_BASE) {
      return "/";
    }

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return "/";
  }
}
