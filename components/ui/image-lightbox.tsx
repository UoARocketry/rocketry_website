"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import ImageWithFallback from "@/components/ui/image-with-fallback";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
/** What a double tap jumps to, and back from. */
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP_PX = 24;

interface ImageLightboxProps {
  readonly images: readonly string[];
  readonly index: number;
  readonly alt: string;
  readonly onClose: () => void;
  readonly onIndexChange?: (index: number) => void;
}

/** Zoom and pan held together, because a pinch changes both at once. */
type View = { zoom: number; x: number; y: number };

const RESET: View = { zoom: MIN_ZOOM, x: 0, y: 0 };

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

  const [view, setView] = useState<View>(RESET);
  const [isGesturing, setIsGesturing] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  /**
   * Live pointers, keyed by id. Two at once is a pinch, one is a drag.
   * Tracking them here rather than in state keeps a move handler from
   * re-rendering before it has finished reading the other finger.
   */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinch = useRef<
    { distance: number; midX: number; midY: number } | undefined
  >(undefined);
  const lastDrag = useRef<{ x: number; y: number } | undefined>(undefined);
  const lastTap = useRef<{ at: number; x: number; y: number } | undefined>(
    undefined,
  );

  const goTo = (next: number) => {
    onIndexChange?.((next + images.length) % images.length);
  };

  /**
   * Keeps the image overlapping its frame.
   *
   * The image is `object-contain`, so at zoom 1 it may be letterboxed and
   * there is nothing to pan to; past that, half the overflow in each axis is
   * the furthest it can usefully move.
   */
  const clamp = useCallback((next: View): View => {
    const viewport = viewportRef.current;
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.zoom));

    if (!viewport || zoom <= MIN_ZOOM) return { zoom, x: 0, y: 0 };

    const maxX = (viewport.clientWidth * (zoom - 1)) / 2;
    const maxY = (viewport.clientHeight * (zoom - 1)) / 2;

    return {
      zoom,
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }, []);

  /** Viewport centre in page coordinates, the origin the transform works in. */
  const centre = () => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  /**
   * Rescales around a fixed screen point, so the spot under the fingers stays
   * under the fingers. Zooming about the centre instead made a pinch feel like
   * the image was sliding away from you.
   */
  const zoomAround = useCallback(
    (previous: View, nextZoom: number, screenX: number, screenY: number) => {
      const origin = centre();
      const focusX = screenX - origin.x;
      const focusY = screenY - origin.y;
      const ratio = nextZoom / previous.zoom;

      return clamp({
        zoom: nextZoom,
        x: focusX - ratio * (focusX - previous.x),
        y: focusY - ratio * (focusY - previous.y),
      });
    },
    [clamp],
  );

  const zoomInFromCentre = () =>
    setView((previous) => clamp({ ...previous, zoom: previous.zoom + ZOOM_STEP }));
  const zoomOutFromCentre = () =>
    setView((previous) => clamp({ ...previous, zoom: previous.zoom - ZOOM_STEP }));

  useEffect(() => {
    setView(RESET);
  }, [index]);

  /**
   * Focus management for the dialog.
   *
   * `role="dialog"` and `aria-modal` describe the intent, but the browser does
   * nothing on their own. Without this, opening the lightbox left focus on the
   * thumbnail behind the overlay, so a screen reader was never moved into the
   * dialog and Tab walked through the page underneath it, which is invisible
   * but still focusable. Verified in a real browser before this was added.
   *
   * On open: remember what was focused and move focus into the dialog.
   * While open: keep Tab inside it.
   * On close: put focus back where it started, so the keyboard position is not
   * lost.
   */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    // Stops the page behind rubber-banding when a drag reaches the edge.
    document.body.style.overscrollBehavior = "none";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = [
          ...dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
          ),
        ].filter((element) => element.offsetParent !== null);

        if (focusable.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        // Wrap at both ends, and pull focus back in if it has escaped the
        // dialog entirely (which is the state the page starts in).
        if (event.shiftKey && (active === first || !dialog.contains(active))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
          event.preventDefault();
          first.focus();
        }
      } else if (event.key === "Escape") {
        onClose();
      } else if (hasMultiple && event.key === "ArrowLeft") {
        goTo(index - 1);
      } else if (hasMultiple && event.key === "ArrowRight") {
        goTo(index + 1);
      } else if (event.key === "+" || event.key === "=") {
        zoomInFromCentre();
      } else if (event.key === "-") {
        zoomOutFromCentre();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, hasMultiple, index, images.length]);

  const readPointers = () => [...pointers.current.values()];

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsGesturing(true);

    const active = readPointers();

    if (active.length === 2) {
      const [a, b] = active;
      lastPinch.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
      };
      lastDrag.current = undefined;
    } else if (active.length === 1) {
      lastDrag.current = { x: event.clientX, y: event.clientY };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const active = readPointers();

    if (active.length >= 2) {
      const [a, b] = active;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const previous = lastPinch.current;

      if (!previous || previous.distance === 0) {
        lastPinch.current = { distance, midX, midY };
        return;
      }

      const scaleBy = distance / previous.distance;
      const panX = midX - previous.midX;
      const panY = midY - previous.midY;

      setView((current) => {
        const nextZoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, current.zoom * scaleBy),
        );
        const zoomed = zoomAround(current, nextZoom, midX, midY);

        // Two fingers moving together drag as well as pinch.
        return clamp({ ...zoomed, x: zoomed.x + panX, y: zoomed.y + panY });
      });

      lastPinch.current = { distance, midX, midY };
      return;
    }

    const previous = lastDrag.current;
    if (!previous) return;

    const deltaX = event.clientX - previous.x;
    const deltaY = event.clientY - previous.y;
    lastDrag.current = { x: event.clientX, y: event.clientY };

    setView((current) =>
      current.zoom <= MIN_ZOOM
        ? current
        : clamp({ ...current, x: current.x + deltaX, y: current.y + deltaY }),
    );
  };

  /** Toggles between fit and close-up at the point that was tapped. */
  const toggleZoomAt = (screenX: number, screenY: number) => {
    setView((current) =>
      current.zoom > MIN_ZOOM
        ? RESET
        : zoomAround(current, DOUBLE_TAP_ZOOM, screenX, screenY),
    );
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const wasTracked = pointers.current.delete(event.pointerId);
    const remaining = readPointers();

    if (remaining.length < 2) lastPinch.current = undefined;

    if (remaining.length === 1) {
      // Lifting one finger of a pinch continues as a drag from where the
      // other one is, rather than jumping.
      lastDrag.current = { x: remaining[0].x, y: remaining[0].y };
    } else if (remaining.length === 0) {
      lastDrag.current = undefined;
      setIsGesturing(false);
    }

    if (!wasTracked || event.pointerType === "mouse") return;

    const now = Date.now();
    const previous = lastTap.current;
    const isDoubleTap =
      previous &&
      now - previous.at < DOUBLE_TAP_MS &&
      Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <
        DOUBLE_TAP_SLOP_PX;

    if (isDoubleTap) {
      toggleZoomAt(event.clientX, event.clientY);
      lastTap.current = undefined;
    } else {
      lastTap.current = { at: now, x: event.clientX, y: event.clientY };
    }
  };

  if (!current) return null;

  return createPortal(
    <div
      ref={dialogRef}
      // -1 so the container itself can receive focus on open without joining
      // the tab order.
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 outline-none"
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
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
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
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        // Without this the browser claims the gesture as a page scroll or its
        // own pinch, and the pointer events stop arriving mid-drag. It is the
        // single reason dragging felt broken on a phone.
        style={{ touchAction: "none" }}
        className={`flex h-[90vh] w-[95vw] items-center justify-center overflow-hidden ${
          view.zoom > MIN_ZOOM ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        {/* h-full/w-full (not h-auto) so smaller source images scale UP to fill
            the viewport — otherwise a small upload renders at its intrinsic
            size and the "view closely" action shows it no larger than the page. */}
        <ImageWithFallback
          src={current}
          alt={alt}
          width={1920}
          height={1440}
          sizes="95vw"
          draggable={false}
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
            // Animating during a gesture leaves the image trailing the finger.
            transition: isGesturing ? "none" : "transform 150ms",
          }}
          className="h-full w-full select-none rounded-lg object-contain"
        />
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/50 px-4 py-2 text-white"
      >
        <button
          type="button"
          onClick={zoomOutFromCentre}
          disabled={view.zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        >
          −
        </button>
        <span className="w-12 text-center text-sm tabular-nums">
          {Math.round(view.zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomInFromCentre}
          disabled={view.zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
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
