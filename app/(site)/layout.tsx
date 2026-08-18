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
  icons: {
    icon: "/UARC logo.png",
    shortcut: "/UARC logo.png",
    apple: "/UARC logo.png",
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollegeOrUniversity",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "UARC",
  url: SITE_URL,
  logo: `${SITE_URL}/UARC logo.png`,
  email: "uoarocketryclub@auckland.ac.nz",
  sameAs: [
    "https://discord.gg/8afab78eyf",
    "https://www.linkedin.com/company/the-university-of-auckland-rocketry-club/home/",
    "https://www.instagram.com/uoarocketryclub/",
  ],
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "University of Auckland",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let joinUrl = "";

  try {
    const settings = await getSiteSettings();
    joinUrl = settings.memberJoinUrl;
  } catch (error) {
    console.error("[app/layout] Failed to load site settings:", error);
  }

  return (
    <html lang="en">
      <body
        className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
