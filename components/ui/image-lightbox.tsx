"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface ImageLightboxProps {
  readonly images: readonly string[];
  readonly index: number;
  readonly alt: string;
  readonly onClose: () => void;
  readonly onIndexChange?: (index: number) => void;
}

export default function ImageLightbox({
  images,
  index,
  alt,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const hasMultiple = images.length > 1 && Boolean(onIndexChange);
  const current = images[index] ?? images[0];

  const goTo = (next: number) => {
    onIndexChange?.((next + images.length) % images.length);
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (hasMultiple && event.key === "ArrowLeft") {
        goTo(index - 1);
      } else if (hasMultiple && event.key === "ArrowRight") {
        goTo(index + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, hasMultiple, index, images.length]);

  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <Image
        src={current}
        alt={alt}
        width={1920}
        height={1440}
        sizes="95vw"
        className="h-auto max-h-[90vh] w-auto max-w-[95vw] rounded-lg object-contain"
        onClick={(event) => event.stopPropagation()}
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goTo(index - 1);
            }}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
          >
            <svg
              className="h-6 w-6"
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
            onClick={(event) => {
              event.stopPropagation();
              goTo(index + 1);
            }}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
          >
            <svg
              className="h-6 w-6"
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
        </>
      )}
    </div>,
    document.body,
  );
}
