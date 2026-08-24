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

    return [
      {
        source: "/:path*",
        headers: [
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
          { key: "Content-Security-Policy-Report-Only", value: csp },
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
