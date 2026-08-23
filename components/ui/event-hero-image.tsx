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
        className="block w-full cursor-zoom-in"
        aria-label="View image in full size"
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={900}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="w-full h-96 object-contain rounded-lg shadow-lg bg-surface"
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
