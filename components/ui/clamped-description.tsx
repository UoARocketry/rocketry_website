"use client";

import { useEffect, useRef, useState } from "react";

const CLAMP_CLASS: Record<number, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
};

interface ClampedDescriptionProps {
  readonly text: string;
  /** Number of lines to show before clamping. */
  readonly lines: 2 | 3;
}

/**
 * Shows a "see more" hint only when the text is actually cut off.
 *
 * CSS has no way to detect that a line clamp took effect, so the element is
 * measured: a clamped element's scrollHeight exceeds its clientHeight.
 */
export default function ClampedDescription({
  text,
  lines,
}: ClampedDescriptionProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // ResizeObserver fires once on observe, so this covers the initial
    // measurement as well as later reflows (resize, late-loading fonts)
    // without setting state synchronously during the effect.
    const observer = new ResizeObserver(() => {
      setIsTruncated(element.scrollHeight > element.clientHeight + 1);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [text, lines]);

  return (
    <div>
      <p
        ref={ref}
        className={`text-text-secondary text-sm leading-relaxed ${CLAMP_CLASS[lines]}`}
      >
        {text}
      </p>
      {isTruncated && (
        <span className="mt-1 inline-block text-xs text-text-muted">
          … see more
        </span>
      )}
    </div>
  );
}
