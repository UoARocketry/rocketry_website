import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSiteSettings } from "@/lib/site-data";
import { resolveServerUrl } from "@/lib/env";
import { toSafeJsonLd } from "@/lib/utils";
import {
  DEFAULT_CONTACT_EMAIL,
  DEFAULT_DISCORD_URL,
  DEFAULT_INSTAGRAM_URL,
  DEFAULT_LINKEDIN_URL,
} from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "University of Auckland Rocketry Club";
const SITE_DESCRIPTION =
  "Student-led rocketry club dedicated to designing, building, and launching rockets. Join us in exploring aerospace engineering and space exploration.";
const SITE_URL = resolveServerUrl() ?? "https://www.uoarocketry.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "rocketry",
    "aerospace",
    "engineering",
    "university of auckland",
    "UARC",
    "rockets",
    "space",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    // SVG first so capable browsers get a crisp icon at any size; the PNGs are
    // the fallback. The wordmark is 2.8:1 and turned to mush in a square slot,
    // so the icon is a dedicated square rocket mark instead.
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/UARC logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/UARC logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let joinUrl = "";
  let linkedinUrl = DEFAULT_LINKEDIN_URL;
  let instagramUrl = DEFAULT_INSTAGRAM_URL;
  let discordUrl = DEFAULT_DISCORD_URL;
  let contactEmail = DEFAULT_CONTACT_EMAIL;

  try {
    const settings = await getSiteSettings();
    joinUrl = settings.memberJoinUrl;
    linkedinUrl = settings.linkedinUrl?.trim() || DEFAULT_LINKEDIN_URL;
    instagramUrl = settings.instagramUrl?.trim() || DEFAULT_INSTAGRAM_URL;
    discordUrl = settings.discordUrl?.trim() || DEFAULT_DISCORD_URL;
    contactEmail = settings.contactEmail?.trim() || DEFAULT_CONTACT_EMAIL;
  } catch (error) {
    console.error("[app/layout] Failed to load site settings:", error);
  }

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "UARC",
    url: SITE_URL,
    logo: `${SITE_URL}/UARC logo.png`,
    email: contactEmail,
    sameAs: [discordUrl, linkedinUrl, instagramUrl],
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "University of Auckland",
    },
  };

  return (
    <html lang="en">
      <body
        className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJsonLd(organizationJsonLd) }}
        />
        <Navigation joinUrl={joinUrl} />
        <ScrollToTop />
        <div className="relative pt-16 min-h-screen mt-16 mb-16">
          {children}
        </div>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
