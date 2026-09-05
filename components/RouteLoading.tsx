import { PuffLoader } from "react-spinners";

/**
 * Shown by every route's `loading.tsx` while a segment streams in.
 *
 * The colour comes from the theme rather than a literal. This previously used
 * `#F97316` for the spinner and `text-orange-400` for the label, which are
 * Tailwind's oranges rather than the brand's `#C25632` family, so the one thing
 * a visitor sees on every single navigation was the only off-brand colour left
 * on the site. `PuffLoader` interpolates `color` straight into a border
 * shorthand, so a custom property resolves normally.
 */
export default function RouteLoading() {
  return (
    <div
      // Announced politely so a screen reader user is told the page is
      // fetching, rather than meeting silence between routes.
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-20 flex items-center justify-center min-h-[60vh]"
    >
      <div className="flex flex-col items-center">
        <div
          className="w-16 h-16 mb-4 flex items-center justify-center"
          aria-hidden="true"
        >
          <PuffLoader
            color="var(--color-primary-light)"
            loading={true}
            size={60}
            cssOverride={{ display: "block" }}
          />
        </div>
        <span
          className="text-primary text-lg mt-2 font-semibold tracking-wide drop-shadow"
        >
          Loading...
        </span>
      </div>
    </div>
  );
}
