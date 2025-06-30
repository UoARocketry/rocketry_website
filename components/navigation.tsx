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
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              UARC
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/about"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/events"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Events
              </Link>
              <Link
                href="/blogs"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/rockets"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Rockets
              </Link>
              <Link
                href="/sponsors"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sponsors
              </Link>
              <Link
                href="/signup"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Burger menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-700 hover:text-gray-900 cursor-pointer focus:outline-none focus:text-gray-900">
              <BurgerMenu isOpen={isMenuOpen} />
            </button>
          </div>
        </div>

        {/* Burger nav */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="/about" className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Events
              </Link>
              <Link href="/blogs" className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Blog
              </Link>
              <Link href="/rockets" className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Rockets
              </Link>
              <Link href="/sponsors" className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Sponsors
              </Link>
              <Link href="/signup" className="bg-red-600 hover:bg-red-700 text-white block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}