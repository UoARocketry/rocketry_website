import React from "react";
import Image from "next/image";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import ImagePlaceholder from "@/components/ui/image-placeholder";
import {
  parsePhotoFraming,
  photoFramingStyle,
} from "@/lib/photo-position";
import ClampedDescription from "@/components/ui/clamped-description";
import StatusBadgePill, {
  type StatusBadge,
} from "@/components/ui/status-badge";

interface CardProps {
  /** Absent or empty renders the themed placeholder instead. */
  readonly image?: string | null;
  /**
   * Editor-chosen focus and zoom for the crop, from the CMS. Ignored in
   * `poster` mode, where the whole image is shown and there is nothing to
   * frame. Falls back to a centred crop when absent.
   */
  readonly imagePosition?: string | null;
  readonly title: string;
  readonly date: string;
  readonly description: string;
  readonly tag?: string | null;
  /** Optional right-aligned detail, e.g. a multi-session series summary. */
  readonly meta?: string | null;
  /** Optional status pill, e.g. a rocket that has not launched yet. */
  readonly badge?: StatusBadge | null;
  readonly reverse?: boolean;
  readonly vertical?: boolean;
  /**
   * Treat the image as a poster rather than a photo: show it whole in a 4:5
   * portrait frame instead of cropping it to a landscape strip.
   *
   * Event artwork is reused from the club's Instagram posts, where the poster
   * *is* the content — the title, date, time and location are all rendered
   * into the image. Cropping one to a short landscape band cuts that text off
   * entirely. Photos, like rockets, still crop, because a crop of a photo
   * loses nothing that matters.
   */
  readonly poster?: boolean;
}

/** Marks a card as part of a series — a stacked-layers glyph beside the count. */
function SeriesBadge({ label }: { readonly label: string }) {
  return (
    <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4M4 17l8 4 8-4"
        />
      </svg>
      {label}
    </span>
  );
}

function shellClasses(isSeries: boolean, badge?: StatusBadge | null) {
  // A multi-session series gets a warmer border, ring and primary wash so it
  // reads as distinct in a grid of one-off events.
  if (isSeries) {
    return "border-primary/50 hover:border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20";
  }

  // A highlighted badge only warms the border. On the rockets page a section
  // divider already groups these cards, so anything heavier double-signals.
  if (badge?.tone === "primary") {
    return "border-primary/30 hover:border-primary/60";
  }

  return "border-border hover:border-primary/50";
}

export default function Card({
  image,
  imagePosition,
  title,
  date,
  description,
  tag,
  meta,
  badge,
  reverse = false,
  vertical = false,
  poster = false,
}: CardProps) {
  const imageSrc = image ?? "";
  const hasImage = imageSrc.length > 0;
  const isSeries = Boolean(meta);
  const seriesShell = shellClasses(isSeries, badge);
  const trimmedDescription = description.trim();
  const framing = photoFramingStyle(parsePhotoFraming(imagePosition));

  if (vertical) {
    return (
      <div
        className={`group bg-card rounded-xl border overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 ${seriesShell} ${
          // Bounding the card's WIDTH, rather than the frame's height, is what
          // keeps a true 4:5. Capping height alone left the frame as wide as
          // its column, so on the home page a lone card was 628x448 (1.4:1)
          // and a portrait poster sat in ~135px of blurred band each side.
          poster ? "w-full max-w-sm mx-auto" : ""
        }`}
      >
        {poster ? (
          // True 4:5, always. The card's max-width above is what stops this
          // growing past roughly 480px tall, so no height cap is needed and
          // the frame never drifts off the poster's own aspect ratio.
          <div className="relative aspect-4/5 overflow-hidden bg-surface">
            {hasImage ? (
              <>
                {/* Blurred copy fills whatever the poster does not, so an image
                    that is not exactly 4:5 sits on its own colours rather than a
                    hard letterbox. Same treatment as the event detail hero. */}
                <Image
                  src={imageSrc}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="scale-110 object-cover opacity-30 blur-2xl"
                />
                <ImageWithFallback
                  src={imageSrc}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="relative object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </>
            ) : (
              <ImagePlaceholder className="absolute inset-0" />
            )}
            {/* The hover wash. Dropping this was what made these cards feel
                dead on hover: the card still lifts, but on a frame this large
                a 4px lift is invisible, so the overlay is the signal. */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          // The height moves to the wrapper because a framed image is
          // positioned absolutely, so it can no longer give the box its height.
          <div className="relative h-48 overflow-hidden">
            {hasImage ? (
              <ImageWithFallback
                src={imageSrc}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                style={framing}
                className="transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <ImagePlaceholder className="absolute inset-0" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        <div
          className={`flex-1 p-6 flex flex-col justify-between ${
            isSeries ? "bg-linear-to-br from-primary/8 to-transparent" : ""
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-xs font-medium text-primary">{date}</span>
              {tag && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  {tag}
                </span>
              )}
              {badge && <StatusBadgePill badge={badge} />}
              {meta && <SeriesBadge label={meta} />}
            </div>
            <h3 className="text-lg font-semibold text-text-main mb-2 group-hover:text-primary transition-colors duration-200">
              {title}
            </h3>
            <ClampedDescription text={trimmedDescription} lines={2} />
          </div>
          <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Learn more
            <svg
              className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      // Taller than a text-led card needs to be, because this layout carries
      // rocket photos, which are usually portrait. At the old h-72 a 2:3 photo
      // showed as a thin horizontal band whatever you framed it on.
      className={`group bg-card rounded-xl border overflow-hidden flex h-88 md:h-96 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 ${seriesShell} ${
        reverse
          ? "flex-col-reverse md:flex-row-reverse"
          : "flex-col md:flex-row"
      }`}
    >
      <div className="relative overflow-hidden h-56 md:h-full md:w-1/2">
        {hasImage ? (
          <ImageWithFallback
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={framing}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div
        className={`flex-1 p-6 flex flex-col justify-center ${
          isSeries ? "bg-linear-to-br from-primary/8 to-transparent" : ""
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-xs font-medium text-primary">{date}</span>
          {tag && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              {tag}
            </span>
          )}
          {badge && <StatusBadgePill badge={badge} />}
          {meta && <SeriesBadge label={meta} />}
        </div>
        <h3 className="text-xl font-semibold text-text-main mb-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        <ClampedDescription text={trimmedDescription} lines={3} />
        <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          View details
          <svg
            className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
