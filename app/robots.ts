import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/env";

const SITE_URL = resolveSiteUrl();

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
