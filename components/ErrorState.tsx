"use client";

import React from "react";

type Props = {
  /** Next hands every error boundary this. Calling it re-renders the segment. */
  readonly onRetry?: () => void;
  readonly align?: "center" | "left";
  readonly className?: string;
};

/**
 * Shown when a route segment throws.
 *
 * Deliberately separate from `SectionFallback`, which says "Coming Soon" and is
 * the right answer for a section the club has not filled in yet. Using it for a
 * thrown error told the visitor the content did not exist, when in fact it
 * exists and we failed to load it, and it offered no way forward. Next passes
 * every error boundary a `reset` function for exactly this, and none of ours
 * were calling it.
 */
export default function ErrorState({
  onRetry,
  align = "center",
  className = "",
}: Props) {
  const justifyClass = align === "left" ? "justify-start" : "justify-center";
  const textAlignClass = align === "left" ? "text-left" : "text-center";

  return (
    <div className={`w-full flex ${justifyClass} ${className}`}>
      <div
        role="alert"
        className={`relative max-w-2xl w-full bg-card rounded-xl border border-border p-10 ${textAlignClass}`}
      >
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4 ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-text-main mb-2">
          This page didn&rsquo;t load
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Something went wrong at our end. Trying again usually fixes it.
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-text-main transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-main focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
