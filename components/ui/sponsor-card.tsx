import ImageWithFallback from "@/components/ui/image-with-fallback";
import { toInitials } from "@/lib/initials";
import type { Sponsor } from "@/lib/site-data";

export default function SponsorCard({
  sponsor,
}: {
  readonly sponsor: Sponsor;
}) {
  const logoSrc = sponsor.logo?.trim() || null;
  // Nothing in the file says whether a logo is dark or pale, so the editor
  // does. A white reverse logo on the default white plate renders as nothing.
  const isDarkPlate = sponsor.logoPlate === "dark";

  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-card rounded-xl border border-border flex flex-col items-center p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex w-full flex-col items-center">
        {/* A fixed plate rather than one that shrinks to the logo. Sponsor
            artwork ranges from near-square badges to wordmarks close to 3:1,
            and sizing the plate to each one left every card in the grid with
            its logo on a different baseline. The logo is contained, never
            cropped, so a wide one fits by width and a tall one by height. */}
        <div
          className={`w-full rounded-lg p-4 mb-4 transition-transform duration-300 group-hover:scale-105 ${
            isDarkPlate ? "bg-[#111318] border border-white/10" : "bg-white"
          }`}
        >
          {/* Taller than it was, and the logo is held back from the full plate
              width. `object-contain` scales to whichever edge binds first, so
              a 3:1 wordmark used to fill the plate while a square badge sat at
              64px in the middle of it — roughly a quarter the visual weight
              for the same tier. */}
          <div className="relative mx-auto h-20 w-[85%] sm:h-24">
            {logoSrc ? (
              <ImageWithFallback
                src={logoSrc}
                alt={sponsor.name}
                fill
                sizes="(max-width: 640px) 90vw, 280px"
                className="object-contain"
              />
            ) : (
              // Never the UARC logo: on a sponsor card it reads as that
              // sponsor's mark rather than as a missing one.
              <div
                className="flex h-full w-full items-center justify-center"
                aria-hidden="true"
              >
                <span
                  className={`text-3xl font-extrabold tracking-tight ${
                    isDarkPlate ? "text-white/40" : "text-black/25"
                  }`}
                >
                  {toInitials(sponsor.name)}
                </span>
              </div>
            )}
          </div>
        </div>
        <h3 className="text-base font-semibold text-text-main mb-1 text-center group-hover:text-primary transition-colors duration-200">
          {sponsor.name}
        </h3>
        {sponsor.description && (
          <p className="text-sm text-text-secondary text-center mt-1 leading-relaxed">
            {sponsor.description}
          </p>
        )}

        {/* External link indicator */}
        <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Visit website
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}
