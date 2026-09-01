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

/** Longest edge of the preview box. The short edge follows `aspect`. */
const PREVIEW_EXTENT = 200;
const ZOOM_STEP = 0.25;

/**
 * Supplied per field via `clientProps` in `createImagePairFields`, so one
 * component serves the circular exec headshot and the landscape card frames.
 * Defaults describe the exec photo, which was the original caller.
 */
type FramingProps = {
  uploadField?: string;
  urlField?: string;
  shape?: "circle" | "rect";
  aspect?: number;
  appliesTo?: string;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

/**
 * Preview box matching the site frame's shape. A frame wider than it is tall
 * is capped on width, a taller one on height, so no shape overruns the field.
 */
function previewSize(aspect: number): { width: number; height: number } {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;

  return safeAspect >= 1
    ? { width: PREVIEW_EXTENT, height: Math.round(PREVIEW_EXTENT / safeAspect) }
    : { width: Math.round(PREVIEW_EXTENT * safeAspect), height: PREVIEW_EXTENT };
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

export const PhotoPositionField: TextFieldClientComponent = (props) => {
  const { path, field } = props;
  const {
    uploadField = "photoMedia",
    urlField = "photo",
    shape = "circle",
    aspect = 1,
    appliesTo,
  } = props as unknown as FramingProps;

  const { value, setValue } = useField<string>({ path });

  // The sibling URL field is only filled in by a server-side beforeChange
  // hook, so it stays empty in the form until after a successful save. Read
  // the upload relation as well so the preview works immediately.
  const imageText = useFormFields(([fields]) => fields?.[urlField]?.value);
  const imageMedia = useFormFields(([fields]) => fields?.[uploadField]?.value);

  // Keyed by id so a stale result from a previously selected file is never
  // shown, without needing to clear state synchronously during a render.
  const [resolved, setResolved] = useState<{ id: string; url: string } | null>(
    null,
  );

  const upload = readUploadValue(imageMedia);
  const uploadId = upload.id;
  const directUrl =
    upload.url || (typeof imageText === "string" ? imageText : "");
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
  const { width, height } = previewSize(aspect);
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
    // percentage moves the opposite way to the pointer. Each axis is scaled by
    // its own edge, or dragging feels wrong on a frame that is not square.
    const deltaX = ((event.clientX - drag.startX) / width) * 100;
    const deltaY = ((event.clientY - drag.startY) / height) * 100;

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

  const frameName = shape === "circle" ? "circular crop" : "frame";
  const where = appliesTo ? ` on ${appliesTo}` : "";
  const labelText =
    typeof field?.label === "string" ? field.label : "Image position";

  return (
    <div className="field-type" style={{ marginBottom: "1.5rem" }}>
      <label className="field-label">{labelText}</label>
      <p
        style={{
          marginTop: 0,
          marginBottom: "0.75rem",
          fontSize: "0.8rem",
          opacity: 0.7,
        }}
      >
        {photoUrl
          ? `Drag the image to choose which part shows inside the ${frameName}${where}, and zoom in to reframe more tightly. This preview is the shape of the real frame.`
          : "Upload an image above to position it."}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            position: "relative",
            width,
            height,
            borderRadius: shape === "circle" ? "50%" : "0.25rem",
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
              alt="Image position preview"
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
