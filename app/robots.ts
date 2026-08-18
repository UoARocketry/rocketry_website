import type { MetadataRoute } from "next";
import { resolveServerUrl } from "@/lib/env";

const SITE_URL = resolveServerUrl() ?? "https://www.uoarocketry.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
