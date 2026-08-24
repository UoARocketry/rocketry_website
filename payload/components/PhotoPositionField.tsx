"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { TextFieldClientComponent } from "payload";
import { useField, useFormFields } from "@payloadcms/ui";

const DEFAULT_POSITION = "50% 50%";
const PREVIEW_SIZE = 180;

function parsePosition(value: unknown): { x: number; y: number } {
  if (typeof value !== "string") return { x: 50, y: 50 };

  const matches = value.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!matches) return { x: 50, y: 50 };

  return {
    x: clampPercent(Number(matches[1])),
    y: clampPercent(Number(matches[2])),
  };
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

export const PhotoPositionField: TextFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<string>({ path });
  const photo = useFormFields(([fields]) => fields?.photo?.value);
  const photoUrl = typeof photo === "string" ? photo : "";

  const position = parsePosition(value);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  const commit = (next: { x: number; y: number }) => {
    setValue(`${Math.round(next.x)}% ${Math.round(next.y)}%`);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!photoUrl) return;
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag) return;

    // Dragging the image down reveals more of its top, which is a *lower*
    // object-position percentage — hence the inverted delta.
    const deltaX = ((event.clientX - drag.startX) / PREVIEW_SIZE) * 100;
    const deltaY = ((event.clientY - drag.startY) / PREVIEW_SIZE) * 100;

    commit({
      x: clampPercent(drag.startPosX - deltaX),
      y: clampPercent(drag.startPosY - deltaY),
    });
  };

  const handlePointerUp = () => {
    dragState.current = null;
    setIsDragging(false);
  };

  return (
    <div className="field-type" style={{ marginBottom: "1.5rem" }}>
      <label className="field-label">Photo position</label>
      <p
        style={{
          marginTop: 0,
          marginBottom: "0.75rem",
          fontSize: "0.8rem",
          opacity: 0.7,
        }}
      >
        {photoUrl
          ? "Drag the photo to choose which part shows inside the circular crop on the site. This preview matches the website exactly."
          : "Upload a photo above (and save) to position it."}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid var(--theme-elevation-150)",
            flexShrink: 0,
            background: "var(--theme-elevation-50)",
            cursor: photoUrl ? (isDragging ? "grabbing" : "grab") : "default",
            touchAction: "none",
          }}
        >
          {photoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={photoUrl}
              alt="Photo position preview"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${position.x}% ${position.y}%`,
                userSelect: "none",
              }}
            />
          )}
        </div>

        <div style={{ fontSize: "0.85rem" }}>
          <div style={{ marginBottom: "0.5rem", opacity: 0.7 }}>
            Position: {position.x}% {position.y}%
          </div>
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            onClick={() => setValue(DEFAULT_POSITION)}
            disabled={!photoUrl}
          >
            Reset to centre
          </button>
        </div>
      </div>
    </div>
  );
};
