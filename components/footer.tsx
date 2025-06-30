import Link from "next/link";
import LinkedInIcon from "./ui/linkedin-icon";
import FacebookIcon from "./ui/facebook-icon";
import InstagramIcon from "./ui/instagram-icon";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">UARC</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              The University of Auckland Rocketry Club is a student-led rocketry club dedicated to designing, 
              building, and launching rockets. Join us in exploring aerospace engineering and space exploration.
            </p>
            <div className="flex space-x-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <LinkedInIcon />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FacebookIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/rockets" className="text-gray-300 hover:text-white transition-colors">
                  Rockets
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="text-gray-300 hover:text-white transition-colors">
                  Sponsors
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2">
              <p className="text-gray-300">
                <a href="mailto:uoarocketryclub@auckland.ac.nz" className="hover:text-white transition-colors">
                  uoarocketryclub@auckland.ac.nz
                </a>
              </p>
              <p className="text-gray-300">
                University of Auckland
              </p>
              <p className="text-gray-300">
                Auckland, New Zealand
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © Copyright 2025 University of Auckland Rocketry Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 