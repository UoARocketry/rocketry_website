"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BurgerMenu from "./ui/burger-menu";

type NavigationProps = {
  joinUrl: string;
};

export default function Navigation({ joinUrl }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();
  const hasJoinUrl = Boolean(joinUrl.trim());

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const updateNavState = () => {
      setIsScrolled(window.scrollY > 20);
    };

    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateNavState);
    };
  }, []);

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/about", label: "ABOUT" },
    { href: "/events", label: "EVENTS" },
    { href: "/rockets", label: "ROCKETS" },
    { href: "/sponsors", label: "SPONSORS" },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-elevated/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${
            isScrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center group">
            <Image
              src="/UARC logo.png"
              alt="UARC Logo"
              width={240}
              height={96}
              className={`w-auto object-contain transition-all duration-300 group-hover:opacity-80 ${
                isScrolled ? "h-10" : "h-12"
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-text-secondary hover:text-text-main"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
            {hasJoinUrl && (
              <Link
                href={joinUrl}
                className="ml-4 bg-primary hover:bg-primary-dark px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                style={{ color: "#ffffff" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                JOIN US
              </Link>
            )}
          </div>

          {/* Burger menu button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-text-secondary hover:text-text-main transition-colors"
            aria-label="Toggle menu"
          >
            <BurgerMenu isOpen={isMenuOpen} />
          </button>
        </div>

        {/* Mobile nav */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-1 border-t border-border">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`block px-4 py-3 text-sm font-medium tracking-wide transition-colors duration-200 rounded-lg ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-text-secondary hover:text-text-main hover:bg-elevated"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            {hasJoinUrl && (
              <div className="pt-4 px-4">
                <Link
                  href={joinUrl}
                  className="block w-full bg-primary hover:bg-primary-dark text-center px-5 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200"
                  style={{ color: "#ffffff" }}
                  onClick={() => setIsMenuOpen(false)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  JOIN US
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
