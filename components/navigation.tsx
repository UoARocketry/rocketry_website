"use client";

import { useState } from "react";
import Link from "next/link";
import BurgerMenu from "./ui/burger-menu";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="!bg-surface shadow-md border-b border-surface fixed w-full top-0 z-50" style={{ backgroundColor: '#232323'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <img
                src="/UARC logo.png"
                alt="UARC Logo"
                className="h-14 w-auto object-contain drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.5))' }}
              />
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/about"
                className="underline-animate text-text-main hover:text-primary px-4 py-2 rounded-none text-sm font-medium transition-colors uppercase">
                ABOUT
              </Link>
              <Link
                href="/events"
                className="underline-animate text-text-main hover:text-primary px-4 py-2 rounded-none text-sm font-medium transition-colors uppercase">
                EVENTS
              </Link>
              <Link
                href="/blogs"
                className="underline-animate text-text-main hover:text-primary px-4 py-2 rounded-none text-sm font-medium transition-colors uppercase">
                BLOG
              </Link>
              <Link
                href="/rockets"
                className="underline-animate text-text-main hover:text-primary px-4 py-2 rounded-none text-sm font-medium transition-colors uppercase">
                ROCKETS
              </Link>
              <Link
                href="/sponsors"
                className="underline-animate text-text-main hover:text-primary px-4 py-2 rounded-none text-sm font-medium transition-colors uppercase">
                SPONSORS
              </Link>
              <Link
                href="/signup"
                className="bg-primary hover:bg-[#a94425] text-white px-6 py-2 rounded-full text-base font-bold shadow transition-colors uppercase text-center"
                style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.15)' }}>
                SIGN UP
              </Link>
            </div>
          </div>

          {/* Burger menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-text-main hover:text-primary cursor-pointer focus:outline-none focus:text-primary">
              <BurgerMenu isOpen={isMenuOpen} />
            </button>
          </div>
        </div>

        {/* Burger nav */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface border-t border-surface">
              <Link href="/about" className="underline-animate text-text-main hover:text-primary block px-4 py-2 rounded-none text-base font-medium uppercase" onClick={() => setIsMenuOpen(false)}>
                ABOUT
              </Link>
              <Link href="/events" className="underline-animate text-text-main hover:text-primary block px-4 py-2 rounded-none text-base font-medium uppercase" onClick={() => setIsMenuOpen(false)}>
                EVENTS
              </Link>
              <Link href="/blogs" className="underline-animate text-text-main hover:text-primary block px-4 py-2 rounded-none text-base font-medium uppercase" onClick={() => setIsMenuOpen(false)}>
                BLOG
              </Link>
              <Link href="/rockets" className="underline-animate text-text-main hover:text-primary block px-4 py-2 rounded-none text-base font-medium uppercase" onClick={() => setIsMenuOpen(false)}>
                ROCKETS
              </Link>
              <Link href="/sponsors" className="underline-animate text-text-main hover:text-primary block px-4 py-2 rounded-none text-base font-medium uppercase" onClick={() => setIsMenuOpen(false)}>
                SPONSORS
              </Link>
              <Link href="/signup" className="bg-primary hover:bg-[#a94425] text-white block px-4 py-2 rounded-none text-base font-medium uppercase text-center" onClick={() => setIsMenuOpen(false)}>
                SIGN UP
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}