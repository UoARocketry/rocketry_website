"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PuffLoader } from "react-spinners";

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
}

export default function ImageWithLoader({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className = "w-full h-auto object-cover",
  containerClassName = "relative",
}: ImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={containerClassName}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center">
              <PuffLoader
                color="#F97316"
                loading={true}
                size={48}
                cssOverride={{ display: "block" }}
              />
            </div>
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={className}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
}
