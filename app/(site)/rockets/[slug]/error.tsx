"use client";
import React, { useEffect } from "react";
import ErrorState from "@/components/ErrorState";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function RocketSlugError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[error-boundary/rockets/[slug]] Render error:", error);
  }, [error]);

  return (
    <main className="min-h-screen max-w-7xl mx-auto pb-16">
      <section className="max-w-7xl mx-auto pt-16 pb-8 px-4 text-left">
        <h1 className="text-5xl font-extrabold mb-4 text-primary">Rocket</h1>
        <ErrorState align="left" onRetry={reset} />
      </section>
    </main>
  );
}
