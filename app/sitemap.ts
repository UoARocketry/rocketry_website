import type { MetadataRoute } from "next";
import { getAllRockets, getEventsOverview } from "@/lib/site-data";
import { resolveServerUrl } from "@/lib/env";

const SITE_URL = resolveServerUrl() ?? "https://www.uoarocketry.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/rockets`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/events`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/sponsors`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let rocketRoutes: MetadataRoute.Sitemap = [];
  let eventRoutes: MetadataRoute.Sitemap = [];

  try {
    const rockets = await getAllRockets();
    rocketRoutes = rockets.map((rocket) => ({
      url: `${SITE_URL}/rockets/${rocket.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("[app/sitemap] Failed to load rockets:", error);
  }

  try {
    const { upcoming, past } = await getEventsOverview();
    eventRoutes = [...upcoming, ...past].map((event) => ({
      url: `${SITE_URL}/events/${event.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("[app/sitemap] Failed to load events:", error);
  }

  return [...staticRoutes, ...rocketRoutes, ...eventRoutes];
}
