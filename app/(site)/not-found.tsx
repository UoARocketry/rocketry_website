import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-text-main px-4">
      <section className="relative max-w-2xl w-full text-center py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">
            Error 404
          </p>
          <h1 className="text-6xl md:text-7xl font-extrabold text-primary mb-4">
            Lost in Orbit
          </h1>
          <p className="text-lg text-text-secondary max-w-md mx-auto mb-10 leading-relaxed">
            The page you&apos;re looking for has drifted off course. It may
            have been moved, renamed, or never existed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
              style={{ color: "#ffffff" }}
            >
              {/* Leads the label rather than trailing it: a backwards action
                  reads left, the same way the "Back to all Events" links do. */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              Back to Home
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 border border-border bg-card px-6 py-3 rounded-lg font-semibold text-text-secondary hover:text-primary hover:border-primary/50 transition-all duration-200"
            >
              Browse Events
            </Link>
            <Link
              href="/rockets"
              className="inline-flex items-center gap-2 border border-border bg-card px-6 py-3 rounded-lg font-semibold text-text-secondary hover:text-primary hover:border-primary/50 transition-all duration-200"
            >
              Browse Rockets
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
