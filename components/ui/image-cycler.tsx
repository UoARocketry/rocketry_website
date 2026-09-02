"use client";

import { useState } from "react";
import Image from "next/image";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import ImagePlaceholder from "@/components/ui/image-placeholder";
import ImageLightbox from "@/components/ui/image-lightbox";

interface ImageCyclerProps {
  /** Empty renders the themed placeholder, with no zoom affordance. */
  readonly images: readonly string[];
  readonly alt: string;
}

const FRAME_HEIGHT = "h-104 sm:h-128 lg:h-152 max-h-[75vh]";

export default function ImageCycler({
  images,
  alt,
}: ImageCyclerProps) {
  const [index, setIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const hasMultiple = images.length > 1;
  const current = images[index] ?? images[0] ?? "";

  const goTo = (next: number) => {
    setIndex((next + images.length) % images.length);
  };

  // No image means nothing to enlarge, so the button and its zoom cursor would
  // be an affordance that leads nowhere.
  if (!current) {
    return (
      <ImagePlaceholder
        className={`relative w-full rounded-lg border border-border shadow-lg ${FRAME_HEIGHT}`}
        label={`${alt}: no image yet`}
      />
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsLightboxOpen(true)}
        className="relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
        aria-label="View image in full size"
      >
        {/* A blurred copy fills the letterbox area. Without it, images whose
            aspect ratio doesn't match the box leave dead space that is
            indistinguishable from the near-black page background. */}
        <Image
          src={current}
          alt=""
          aria-hidden="true"
          width={1200}
          height={900}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
        />
        {/* Taller than a landscape hero needs, because the images here are
            usually portrait: a 2:3 rocket photo, or an event poster whose
            date and location are text inside the image. At h-96 both were
            too small to read. Capped so it still fits on screen. */}
        <ImageWithFallback
          src={current}
          alt={alt}
          width={1200}
          height={1500}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`relative w-full object-contain ${FRAME_HEIGHT}`}
        />
      </button>

      {isLightboxOpen && (
        <ImageLightbox
          images={images}
          index={index}
          alt={alt}
          onClose={() => setIsLightboxOpen(false)}
          onIndexChange={setIndex}
        />
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((image, i) => (
              <button
                key={`${image}-${i}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  i === index
                    ? "w-6 bg-white"
                    : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
