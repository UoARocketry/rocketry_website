import type { CSSProperties } from "react";

export type PhotoFraming = {
  /** Horizontal focus, 0 (left edge) to 100 (right edge). */
  x: number;
  /** Vertical focus, 0 (top edge) to 100 (bottom edge). */
  y: number;
  /** 1 = fit the crop exactly, higher zooms in. */
  zoom: number;
};

export const DEFAULT_FRAMING: PhotoFraming = { x: 50, y: 50, zoom: 1 };
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Stored as a CSS-like shorthand: "<x>% <y>% <zoom>".
 *
 * The trailing zoom is optional so values written before zoom existed
 * ("50% 50%") still parse, defaulting to no zoom.
 */
export function parsePhotoFraming(value: unknown): PhotoFraming {
  if (typeof value !== "string") return DEFAULT_FRAMING;

  const match = value
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%(?:\s+(\d+(?:\.\d+)?))?$/);

  if (!match) return DEFAULT_FRAMING;

  return {
    x: clamp(Number(match[1]), 0, 100),
    y: clamp(Number(match[2]), 0, 100),
    zoom: match[3] ? clamp(Number(match[3]), MIN_ZOOM, MAX_ZOOM) : MIN_ZOOM,
  };
}

export function formatPhotoFraming({ x, y, zoom }: PhotoFraming): string {
  const rounded = Math.round(clamp(zoom, MIN_ZOOM, MAX_ZOOM) * 100) / 100;
  return `${Math.round(clamp(x, 0, 100))}% ${Math.round(clamp(y, 0, 100))}% ${rounded}`;
}

/**
 * The single source of truth for how a framed photo renders. Used by both the
 * admin preview and the public card so what an editor sees is what ships.
 *
 * The image box is scaled to `zoom` and offset so that `x`/`y` always mean
 * "which part of the photo to show", at every zoom level. At zoom 1 the offsets
 * collapse to zero and `object-position` alone frames the cover crop, matching
 * the behaviour before zoom existed.
 *
 * Requires a `position: relative; overflow: hidden` parent.
 */
export function photoFramingStyle({ x, y, zoom }: PhotoFraming): CSSProperties {
  return {
    position: "absolute",
    width: `${zoom * 100}%`,
    height: `${zoom * 100}%`,
    left: `${-(zoom - 1) * x}%`,
    top: `${-(zoom - 1) * y}%`,
    // next/image's `fill` sets right/bottom, which would fight the offsets.
    right: "auto",
    bottom: "auto",
    objectFit: "cover",
    objectPosition: `${x}% ${y}%`,
  };
}
