"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ExecCard from "./ExecCard";
import SectionFallback from "./SectionFallback";
import type { Exec } from "@/lib/site-data";

type ExecApiResponse = {
  docs: Array<{
    id: number | string;
    name: string;
    role: string;
    bio: string;
    photo: string;
    year: number;
    linkedinUrl?: string | null;
  }>;
};

type Props = {
  initialYear: number;
  initialYears: number[];
  initialExecutives: Exec[];
  initialLoadError: boolean;
};

function isExecDoc(value: unknown): value is ExecApiResponse["docs"][number] {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ExecApiResponse["docs"][number]>;
  return (
    (typeof candidate.id === "number" || typeof candidate.id === "string") &&
    typeof candidate.name === "string" &&
    typeof candidate.role === "string" &&
    typeof candidate.bio === "string" &&
    typeof candidate.photo === "string" &&
    typeof candidate.year === "number"
  );
}

function isExecApiResponse(value: unknown): value is ExecApiResponse {
  if (!value || typeof value !== "object") return false;

  const payload = value as Partial<ExecApiResponse>;
  return Array.isArray(payload.docs) && payload.docs.every(isExecDoc);
}

export default function ExecTeamSection({
  initialYear,
  initialYears,
  initialExecutives,
  initialLoadError,
}: Props) {
  const inFlightController = useRef<AbortController | null>(null);

  const [data, setData] = useState<{
    selectedYear: number;
    availableYears: number[];
    executives: Exec[];
  }>({
    selectedYear: initialYear,
    availableYears: initialYears,
    executives: initialExecutives,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(initialLoadError);

  const currentYearIndex = useMemo(
    () => data.availableYears.indexOf(data.selectedYear),
    [data.availableYears, data.selectedYear],
  );
  const previousYear =
    currentYearIndex >= 0
      ? (data.availableYears[currentYearIndex + 1] ?? null)
      : null;
  const nextYear =
    currentYearIndex > 0
      ? (data.availableYears[currentYearIndex - 1] ?? null)
      : null;

  useEffect(() => {
    return () => {
      inFlightController.current?.abort();
    };
  }, []);

  async function loadYear(year: number) {
    inFlightController.current?.abort();

    const controller = new AbortController();
    inFlightController.current = controller;

    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch(
        `/api/executives?where[year][equals]=${year}&sort=order&limit=200&depth=0`,
        {
          cache: "no-store",
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exec team payload");
      }

      const payloadJson: unknown = await response.json();

      if (!isExecApiResponse(payloadJson)) {
        throw new Error("Invalid exec team payload format");
      }

      const executives = payloadJson.docs.map((exec) => ({
        id: typeof exec.id === "number" ? exec.id : Number(exec.id),
        name: exec.name,
        role: exec.role,
        bio: exec.bio,
        photo: exec.photo,
        year: exec.year,
        linkedinUrl: exec.linkedinUrl ?? null,
      }));

      setData((current) => ({
        ...current,
        selectedYear: year,
        executives,
      }));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error("Error loading executive team:", error);
      setHasError(true);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }

  if (hasError) {
    return (
      <SectionFallback
        title="Unable to load executive team"
        description="We are having trouble fetching the executive team. Please try again later."
      />
    );
  }

  if (data.availableYears.length === 0) {
    return (
      <SectionFallback
        title="No executive team data yet"
        description="Executive team records are not available yet."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => previousYear && loadYear(previousYear)}
          disabled={!previousYear || isLoading}
          className="cursor-pointer inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-main transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden="true" className="mr-2">
            &larr;
          </span>
          Previous Year
        </button>

        <div className="min-w-28 text-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-text-main">
          {data.selectedYear}
        </div>

        <button
          type="button"
          onClick={() => nextYear && loadYear(nextYear)}
          disabled={!nextYear || isLoading}
          className="cursor-pointer inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-main transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next Year
          <span aria-hidden="true" className="ml-2">
            &rarr;
          </span>
        </button>
      </div>

      {data.executives.length === 0 ? (
        <SectionFallback
          title="No executive team for this year"
          description="Try another year using the arrows above."
        />
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-150 ${isLoading ? "opacity-70" : "opacity-100"}`}
        >
          {data.executives.map((exec) => (
            <ExecCard key={exec.id} exec={exec} centered={true} />
          ))}
        </div>
      )}
    </div>
  );
}
