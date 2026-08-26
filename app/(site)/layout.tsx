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
// The acronym is in the title because that is what people actually search for,
// and a word can only rank if it appears in the page rather than only in
// metadata Google ignores.
const SITE_TITLE = `${SITE_NAME} (UARC)`;
const SITE_DESCRIPTION =
  "UARC is the University of Auckland Rocketry Club, a student-led club dedicated to designing, building, and launching rockets. Join us in exploring aerospace engineering and space exploration.";
const SITE_URL = resolveServerUrl() ?? "https://www.uoarocketry.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  // No `keywords`: Google has ignored the meta keywords tag since 2009
  // (developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag),
  // so it was carrying the only on-site mention of "UARC" nowhere.
  alternates: {
    canonical: "/",
  },
  icons: {
    // SVG first so capable browsers get a crisp icon at any size; the PNGs are
    // the fallback. The wordmark is 2.8:1 and turned to mush in a square slot,
    // so the icon is a dedicated square rocket mark instead.
    //
    // The 96px PNG exists for Google Search, which recommends a favicon larger
    // than 48x48 and was previously only offered the 32px one via `shortcut`.
    // https://developers.google.com/search/docs/appearance/favicon-in-search
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-96.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/UARC logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
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
    // Not CollegeOrUniversity: this is a student club *inside* a university,
    // and claiming to be the university itself muddles the entity for Google.
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["UARC", "UoA Rocketry Club"],
    description: SITE_DESCRIPTION,
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
