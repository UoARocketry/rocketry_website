"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { TextFieldClientComponent } from "payload";
import { useField, useFormFields } from "@payloadcms/ui";
import {
  DEFAULT_FRAMING,
  MAX_ZOOM,
  MIN_ZOOM,
  formatPhotoFraming,
  parsePhotoFraming,
  photoFramingStyle,
} from "../../lib/photo-position.ts";

const PREVIEW_SIZE = 180;
const ZOOM_STEP = 0.25;

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

/**
 * Pulls a usable image URL out of an upload field's form value, which may be
 * a populated media doc, a bare relation id, or empty depending on whether the
 * file was just selected or loaded from a saved document.
 */
function readUploadValue(value: unknown): { url?: string; id?: string } {
  if (typeof value === "number") return { id: String(value) };
  if (typeof value === "string") {
    return value.startsWith("http") ? { url: value } : { id: value };
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.url === "string") return { url: record.url };
    if (record.id !== undefined) return { id: String(record.id) };
  }

  return {};
}

export const PhotoPositionField: TextFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<string>({ path });

  // The sibling `photo` text field is only filled in by a server-side
  // beforeChange hook, so it stays empty in the form until after a successful
  // save. Read the upload relation as well so the preview works immediately.
  const photoText = useFormFields(([fields]) => fields?.photo?.value);
  const photoMedia = useFormFields(([fields]) => fields?.photoMedia?.value);

  // Keyed by id so a stale result from a previously selected file is never
  // shown, without needing to clear state synchronously during a render.
  const [resolved, setResolved] = useState<{ id: string; url: string } | null>(
    null,
  );

  const upload = readUploadValue(photoMedia);
  const uploadId = upload.id;
  const directUrl =
    upload.url || (typeof photoText === "string" ? photoText : "");
  const photoUrl =
    directUrl || (resolved && resolved.id === uploadId ? resolved.url : "");

  // Only an id is available when a file was just picked — look up its URL.
  useEffect(() => {
    if (directUrl || !uploadId) return;

    let cancelled = false;

    fetch(`/api/media/${uploadId}?depth=0`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((doc) => {
        if (!cancelled && doc && typeof doc.url === "string") {
          setResolved({ id: uploadId, url: doc.url });
        }
      })
      .catch(() => {
        /* preview simply stays empty */
      });

    return () => {
      cancelled = true;
    };
  }, [directUrl, uploadId]);

  const framing = parsePhotoFraming(value);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const commit = (next: Partial<typeof framing>) => {
    setValue(formatPhotoFraming({ ...framing, ...next }));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!photoUrl) return;
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: framing.x,
      originY: framing.y,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag) return;

    // Dragging right reveals more of the image's left side, so the focus
    // percentage moves the opposite way to the pointer.
    const deltaX = ((event.clientX - drag.startX) / PREVIEW_SIZE) * 100;
    const deltaY = ((event.clientY - drag.startY) / PREVIEW_SIZE) * 100;

    commit({
      x: clampPercent(drag.originX - deltaX),
      y: clampPercent(drag.originY - deltaY),
    });
  };

  const handlePointerUp = () => {
    dragState.current = null;
    setIsDragging(false);
  };

  const setZoom = (next: number) =>
    commit({ zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)) });

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
          ? "Drag the photo to choose which part shows inside the circular crop on the site, and zoom in to reframe more tightly. This preview matches the website exactly."
          : "Upload a photo above to position it."}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            position: "relative",
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
              style={{ ...photoFramingStyle(framing), userSelect: "none" }}
            />
          )}
        </div>

        <div style={{ fontSize: "0.85rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              onClick={() => setZoom(framing.zoom - ZOOM_STEP)}
              disabled={!photoUrl || framing.zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              style={{ margin: 0 }}
            >
              −
            </button>
            <span
              style={{ minWidth: "3.5rem", textAlign: "center", opacity: 0.8 }}
            >
              {Math.round(framing.zoom * 100)}%
            </span>
            <button
              type="button"
              className="btn btn--style-secondary btn--size-small"
              onClick={() => setZoom(framing.zoom + ZOOM_STEP)}
              disabled={!photoUrl || framing.zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              style={{ margin: 0 }}
            >
              +
            </button>
          </div>

          <div style={{ marginBottom: "0.5rem", opacity: 0.6 }}>
            Focus: {framing.x}% {framing.y}%
          </div>

          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            onClick={() => setValue(formatPhotoFraming(DEFAULT_FRAMING))}
            disabled={!photoUrl}
            style={{ margin: 0 }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
