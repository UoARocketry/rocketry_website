"use client";

import React, { useState } from "react";
import Image, { type ImageProps } from "next/image";

const PLACEHOLDER_CLASSES =
  "flex items-center justify-center bg-surface text-text-muted text-sm text-center";

type Props = ImageProps & {
  /**
   * Sizing for the failure panel, when the image's own `className` does not
   * size it. Needed where the layout relies on the intrinsic width/height,
   * which a `div` cannot inherit the way an `img` does.
   */
  readonly fallbackClassName?: string;
};

/**
 * next/image that degrades to the same "Image unavailable" panel the About
 * page's team photo uses, instead of a browser-broken-image icon or an empty
 * box. Content images come from the CMS, so a URL can be an external link that
 * has rotted or a bucket object that was deleted.
 *
 * On failure the panel replaces the image and inherits its `className`, so
 * whatever sized the image (`w-full h-48`) sizes the panel too. With `fill` it
 * is positioned absolutely instead, which is safe because `fill` already
 * requires a positioned parent.
 *
 * Deliberately no inline width/height: on an `img` those are attributes and
 * CSS classes beat them, but on a `div` they would have to be inline styles,
 * which would beat the classes and blow the layout out to the intrinsic size.
 * Call sites that need explicit dimensions pass `fallbackClassName`.
 */
export default function ImageWithFallback({
  // Destructured rather than left in the spread so jsx-a11y can see it is
  // always passed through.
  alt,
  className,
  fallbackClassName,
  onError,
  ...imageProps
}: Props) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`${PLACEHOLDER_CLASSES} ${imageProps.fill ? "absolute inset-0" : ""} ${className ?? ""} ${fallbackClassName ?? ""}`}
        role="img"
        aria-label={alt ? `${alt}: image unavailable` : "Image unavailable"}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      alt={alt}
      className={className}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
    />
  );
}
