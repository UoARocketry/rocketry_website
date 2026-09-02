import Link from "next/link";
import Image from "next/image";
import LinkedInIcon from "./ui/linkedin-icon";
import InstagramIcon from "./ui/instagram-icon";
import DiscordIcon from "./ui/discord-icon";
import { getSiteSettings } from "@/lib/site-data";
import {
  DEFAULT_CONTACT_EMAIL,
  DEFAULT_DISCORD_URL,
  DEFAULT_INSTAGRAM_URL,
  DEFAULT_LINKEDIN_URL,
} from "@/lib/constants";

export default async function Footer() {
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/rockets", label: "Rockets" },
    { href: "/sponsors", label: "Sponsors" },
  ];

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
  } catch {
    // Fall back to database value only
  }

  const socialLinks = [
    { href: linkedinUrl, icon: LinkedInIcon, label: "LinkedIn" },
    { href: instagramUrl, icon: InstagramIcon, label: "Instagram" },
    { href: discordUrl, icon: DiscordIcon, label: "Discord" },
  ];

  const hasJoinUrl = Boolean(joinUrl.trim());

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Logo and Description */}
          <div className="md:col-span-5">
            <Image
              src="/UARC logo.png"
              alt="UARC Logo"
              width={180}
              height={72}
              className="h-10 w-auto mb-6"
            />
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm mb-6">
              The University of Auckland Rocketry Club (UARC) is a student-led
              organisation dedicated to designing, building, and launching
              rockets. Join us in exploring aerospace engineering and space
              exploration.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-elevated border border-border flex items-center justify-center text-text-secondary transition-all duration-200 hover:text-primary hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
                    aria-label={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-text-main uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-text-secondary transition-all duration-200 hover:translate-x-1 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold text-text-main uppercase tracking-wider mb-4">
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href={`mailto:${contactEmail}`}
                className="inline-block text-sm text-text-secondary transition-all duration-200 hover:translate-x-1 hover:text-primary"
              >
                {contactEmail}
              </a>
              <p className="text-text-secondary text-sm">
                University of Auckland
              </p>
              <p className="text-text-secondary text-sm">
                Auckland, New Zealand
              </p>
            </div>

            {/* CTA */}
            {hasJoinUrl && (
              <div className="mt-8">
                <Link
                  href={joinUrl}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                  style={{ color: "#ffffff" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join the Club
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-text-muted text-sm text-center">
            {new Date().getFullYear()} University of Auckland Rocketry Club. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
