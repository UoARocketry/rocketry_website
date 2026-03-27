import Link from "next/link";
import React from "react";
import AboutQuickNavIcon from "./icons/about-quick-nav-icon";
import EventsQuickNavIcon from "./icons/events-quick-nav-icon";
import RocketsQuickNavIcon from "./icons/rockets-quick-nav-icon";
import SponsorsQuickNavIcon from "./icons/sponsors-quick-nav-icon";

type Props = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
};

const iconMap: Record<string, React.ReactNode> = {
  about: <AboutQuickNavIcon />,
  events: <EventsQuickNavIcon />,
  rockets: <RocketsQuickNavIcon />,
  sponsors: <SponsorsQuickNavIcon />,
};

export default function QuickNavCard({
  href,
  icon,
  title,
  description,
  className = "",
}: Props) {
  // Determine which icon to use based on title
  const titleLower = title.toLowerCase();
  const svgIcon = titleLower.includes("about")
    ? iconMap.about
    : titleLower.includes("event")
      ? iconMap.events
      : titleLower.includes("rocket")
        ? iconMap.rockets
        : titleLower.includes("sponsor")
          ? iconMap.sponsors
          : null;

  return (
    <Link
      href={href}
      className={`group relative bg-card rounded-xl p-6 text-center border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden ${className}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
          {svgIcon || icon}
        </div>
        <h3 className="text-base font-semibold text-text-main mb-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
