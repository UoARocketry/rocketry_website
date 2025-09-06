import Link from "next/link";
import LinkedInIcon from "./ui/linkedin-icon";
import InstagramIcon from "./ui/instagram-icon";

export default function Footer() {
  return (
    <footer className="!bg-surface text-text-main border-t border-background shadow-lg" style={{backgroundColor: '#232323',}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-start">
            <img src="/UARC logo.png" alt="UARC Logo" className="h-12 mb-4 drop-shadow-lg" style={{ filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.5))' }} />
            <p className="text-text-secondary mb-4 max-w-md">
              The University of Auckland Rocketry Club is a student-led rocketry club dedicated to designing, 
              building, and launching rockets. Join us in exploring aerospace engineering and space exploration.
            </p>
            <div className="flex space-x-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors">
                <LinkedInIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors">
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary text-shadow-lg">Quick Links</h4>
            <ul className="space-y-2 text-left">
              <li>
                <Link href="/about" className="underline-animate text-text-secondary hover:text-primary transition-colors uppercase py-2 rounded-none">
                  ABOUT
                </Link>
              </li>
              <li>
                <Link href="/events" className="underline-animate text-text-secondary hover:text-primary transition-colors uppercase py-2 rounded-none">
                  EVENTS
                </Link>
              </li>
              <li>
                <Link href="/rockets" className="underline-animate text-text-secondary hover:text-primary transition-colors uppercase py-2 rounded-none">
                  ROCKETS
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="underline-animate text-text-secondary hover:text-primary transition-colors uppercase py-2 rounded-none">
                  SPONSORS
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary text-shadow-lg">Contact</h4>
            <div className="space-y-2">
              <p className="text-text-secondary">
                <a href="mailto:uoarocketryclub@auckland.ac.nz" className="hover:text-primary transition-colors">
                  uoarocketryclub@auckland.ac.nz
                </a>
              </p>
              <p className="text-text-secondary">
                University of Auckland
              </p>
              <p className="text-text-secondary">
                Auckland, New Zealand
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background mt-8 pt-8 text-center">
          <p className="text-text-secondary">
            © Copyright 2025 University of Auckland Rocketry Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 