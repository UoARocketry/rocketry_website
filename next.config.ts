import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function getSupabaseHostname(): string | null {
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;
  const baseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  try {
    if (storageUrl) return new URL(storageUrl).hostname;
    if (baseUrl) return new URL(baseUrl).hostname;
  } catch {
    return null;
  }

  return null;
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              port: "",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Image fields across the CMS offer pasting an external URL as an
      // alternative to uploading. Without a matching pattern next/image
      // rejects those hosts outright and the image silently fails to load.
      // Only authenticated admins can set these fields.
      { protocol: "https" as const, hostname: "**" },
    ],
    // Sponsor press kits hand out SVG, and it is the one format that stays
    // crisp at every plate size. The upload field already accepts `image/*`,
    // so without this an editor could upload one and next/image would refuse
    // to serve it, leaving a broken logo with no explanation.
    dangerouslyAllowSVG: true,
    // The two standard mitigations: an SVG is script-capable, so it is served
    // as a download rather than rendered inline if fetched directly, and
    // scripts inside one are refused.
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline'",
  },
  async headers() {
    const supabaseHost = getSupabaseHostname();
    const supabaseSrc = supabaseHost ? `https://${supabaseHost}` : "";

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      // https: covers externally-linked images from CMS image URL fields.
      `img-src 'self' data: blob: https: ${supabaseSrc}`.trim(),
      "font-src 'self' data:",
      `connect-src 'self' https://vitals.vercel-insights.com ${supabaseSrc}`.trim(),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    /*
     * The policy was previously sent as `Report-Only` everywhere, with no
     * `report-uri` or `report-to` directive. That combination enforces nothing
     * and reports nothing, so the header looked like protection in a scan while
     * providing none.
     *
     * It is now enforced on the public site, where the policy was measured in a
     * real browser across every page with zero violations. Note what this does
     * and does not buy: `script-src` still needs 'unsafe-inline' for Next, so
     * this is not meaningful XSS protection. What it does enforce is
     * `form-action` (an injected form cannot post off-site), `base-uri` (no
     * injected <base> can rewrite every relative URL) and `connect-src`.
     *
     * /admin and /api stay Report-Only. Payload's admin ships its own bundle,
     * and breaking the CMS to harden a surface only logged-in editors reach is
     * a bad trade. The two sources are mutually exclusive on purpose: Next
     * appends the headers of *every* matching entry, so an overlapping pair
     * would send both an enforcing and a report-only policy to the admin.
     */
    return [
      {
        source: "/:path((?:admin|api)(?:/.*)?)",
        headers: [
          ...securityHeaders,
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
      {
        source: "/:path((?!admin|api).*)",
        headers: [
          ...securityHeaders,
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  experimental: {
    globalNotFound: true,
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
