"use client";

import { useState } from "react";
import Image from "next/image";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import ImageLightbox from "@/components/ui/image-lightbox";

interface EventHeroImageProps {
  readonly src: string;
  readonly alt: string;
}

export default function EventHeroImage({ src, alt }: EventHeroImageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsLightboxOpen(true)}
        className="relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
        aria-label="View image in full size"
      >
        {/* Blurred fill for the letterbox area — see rocket-image-cycler. */}
        <Image
          src={src}
          alt=""
          aria-hidden="true"
          width={1200}
          height={900}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
        />
        {/* Taller than a landscape hero needs, because event artwork is
            reused from Instagram and is usually a 4:5 portrait poster whose
            date, time and location are text inside the image. At h-96 that
            text was too small to read. Capped so it still fits on screen. */}
        <ImageWithFallback
          src={src}
          alt={alt}
          width={1200}
          height={1500}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="relative w-full h-[26rem] sm:h-[32rem] lg:h-[38rem] max-h-[75vh] object-contain"
        />
      </button>

      {isLightboxOpen && (
        <ImageLightbox
          images={[src]}
          index={0}
          alt={alt}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}
