"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

/**
 * A disclosure that opens and closes smoothly.
 *
 * This replaced a native `<details>`, which every browser snaps open with no
 * animation. The height animates through a one-row grid going `0fr` to `1fr`
 * rather than by measuring the content: measuring needs a layout pass on every
 * open and gets the answer wrong whenever the content reflows underneath it,
 * such as a long description rewrapping on a phone rotate.
 *
 * `children` is still rendered on the server and handed over as a prop, so
 * only the open/closed state ships as client JavaScript.
 */
export default function CollapsibleSection({
  summary,
  children,
  defaultOpen = false,
  className = "",
  summaryClassName = "",
}: {
  readonly summary: ReactNode;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly className?: string;
  readonly summaryClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div data-open={open} className={`group ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={contentId}
        className={summaryClassName}
      >
        {summary}
      </button>
      <div
        id={contentId}
        // Collapsed content stays in the DOM for the animation, so it has to
        // be taken out of the tab order explicitly or a keyboard lands on
        // links nobody can see.
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
