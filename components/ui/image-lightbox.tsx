"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

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
  const nextImage = hasMultiple ? images[(index + 1) % images.length] : null;
  const prevImage = hasMultiple
    ? images[(index - 1 + images.length) % images.length]
    : null;

  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const goTo = (next: number) => {
    onIndexChange?.((next + images.length) % images.length);
  };

  const clampOffset = (value: { x: number; y: number }, forZoom: number) => {
    const viewport = viewportRef.current;
    if (!viewport || forZoom <= MIN_ZOOM) return { x: 0, y: 0 };

    const maxX = (viewport.clientWidth * (forZoom - 1)) / 2;
    const maxY = (viewport.clientHeight * (forZoom - 1)) / 2;

    return {
      x: Math.min(maxX, Math.max(-maxX, value.x)),
      y: Math.min(maxY, Math.max(-maxY, value.y)),
    };
  };

  const zoomIn = () =>
    setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP));
  const zoomOut = () =>
    setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP));

  useEffect(() => {
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    setOffset((current) => clampOffset(current, zoom));
  }, [zoom]);

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
      } else if (event.key === "+" || event.key === "=") {
        zoomIn();
      } else if (event.key === "-") {
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, hasMultiple, index, images.length]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= MIN_ZOOM) return;
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const next = {
      x: dragState.current.startOffsetX + (event.clientX - dragState.current.startX),
      y: dragState.current.startOffsetY + (event.clientY - dragState.current.startY),
    };
    setOffset(clampOffset(next, zoom));
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      {/* Preload neighbouring gallery images so arrow navigation feels instant */}
      {nextImage && (
        <Image
          src={nextImage}
          alt=""
          width={1920}
          height={1440}
          sizes="95vw"
          priority
          aria-hidden="true"
          className="hidden"
        />
      )}
      {prevImage && prevImage !== nextImage && (
        <Image
          src={prevImage}
          alt=""
          width={1920}
          height={1440}
          sizes="95vw"
          priority
          aria-hidden="true"
          className="hidden"
        />
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
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

      <div
        ref={viewportRef}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`flex h-[90vh] w-[95vw] items-center justify-center overflow-hidden ${
          zoom > MIN_ZOOM ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        {/* h-full/w-full (not h-auto) so smaller source images scale UP to fill
            the viewport — otherwise a small upload renders at its intrinsic
            size and the "view closely" action shows it no larger than the page. */}
        <Image
          src={current}
          alt={alt}
          width={1920}
          height={1440}
          sizes="95vw"
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          }}
          className="h-full w-full select-none rounded-lg object-contain transition-transform duration-150"
        />
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/50 px-4 py-2 text-white"
      >
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        >
          −
        </button>
        <span className="w-12 text-center text-sm tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        >
          +
        </button>
      </div>

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
