"use client";

import { useState } from "react";
import Image from "next/image";
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
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={900}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="relative w-full h-96 object-contain"
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
