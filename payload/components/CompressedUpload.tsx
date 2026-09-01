"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, toast, useDocumentInfo, useField } from "@payloadcms/ui";
import imageCompression from "browser-image-compression";

const COMPRESSIBLE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
]);

const MIN_SIZE_TO_COMPRESS_BYTES = 100 * 1024;

/** Quality for the HEIC decode. The compressor below squeezes it again. */
const HEIC_JPEG_QUALITY = 0.92;

function isHeic(file: File): boolean {
  return (
    ["image/heic", "image/heif"].includes(file.type.toLowerCase()) ||
    // A browser that cannot decode the format often cannot name it either and
    // reports an empty or generic type, leaving the extension as the only clue.
    /\.(heic|heif)$/i.test(file.name)
  );
}

/**
 * Converts an iPhone photo to JPEG in the browser.
 *
 * Every browser except Safari refuses to render HEIC, and there is no
 * server-side escape hatch: `sharp` is deliberately absent from this project,
 * so nothing downstream can transcode it. Converting here means the file is a
 * plain JPEG before it is ever uploaded, and the rest of the site never has to
 * know HEIC exists.
 *
 * The decoder is imported only when a HEIC is actually chosen — it carries a
 * WASM payload far larger than the rest of the admin bundle.
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import("heic2any");

  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: HEIC_JPEG_QUALITY,
  });

  // heic2any returns an array for multi-image HEICs, e.g. a Live Photo.
  const blob = Array.isArray(converted) ? converted[0] : converted;

  return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.7,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
};

export const CompressedUpload = () => {
  const { collectionSlug, docConfig, initialState } = useDocumentInfo();
  const { value, setValue } = useField<File>({ path: "file" });
  const processedFiles = useRef<WeakSet<File>>(new WeakSet());
  const [isCompressing, setIsCompressing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (!(value instanceof File)) return;
    if (processedFiles.current.has(value)) return;

    const needsConversion = isHeic(value);
    if (!needsConversion && !COMPRESSIBLE_TYPES.has(value.type)) return;
    if (!needsConversion && value.size < MIN_SIZE_TO_COMPRESS_BYTES) return;

    let cancelled = false;

    (async () => {
      // A HEIC has to become a JPEG whatever its size, because the problem is
      // the format rather than the weight.
      if (needsConversion) {
        setIsConverting(true);
        try {
          const converted = await convertHeicToJpeg(value);
          if (cancelled) return;

          // Handed back through form state so this effect runs again on the
          // JPEG, which then takes the ordinary compression path below.
          setValue(converted);
        } catch (error) {
          console.error("HEIC conversion failed:", error);
          if (!cancelled) {
            processedFiles.current.add(value);
            toast.error(
              "Could not convert that iPhone photo. Save it as a JPEG and try again.",
            );
          }
        } finally {
          if (!cancelled) setIsConverting(false);
        }
        return;
      }

      setIsCompressing(true);
      try {
        const compressedBlob = await imageCompression(value, COMPRESSION_OPTIONS);
        const compressedFile = new File([compressedBlob], value.name, {
          type: compressedBlob.type || value.type,
          lastModified: value.lastModified,
        });

        if (cancelled) return;

        if (compressedFile.size < value.size) {
          processedFiles.current.add(compressedFile);
          setValue(compressedFile);
        } else {
          processedFiles.current.add(value);
        }
      } catch (error) {
        console.error("Image compression failed, uploading original file:", error);
        if (!cancelled) {
          processedFiles.current.add(value);
          toast.error("Could not compress image, uploading original file");
        }
      } finally {
        if (!cancelled) setIsCompressing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value, setValue]);

  const uploadConfig = docConfig && "upload" in docConfig ? docConfig.upload : undefined;

  if (!collectionSlug || !uploadConfig) return null;

  return (
    <div>
      {(isConverting || isCompressing) && (
        <div style={{ marginBottom: "0.5rem", fontSize: "13px", opacity: 0.75 }}>
          {isConverting
            ? "Converting iPhone photo to JPEG…"
            : "Compressing image…"}
        </div>
      )}
      <Upload
        collectionSlug={collectionSlug}
        initialState={initialState}
        uploadConfig={uploadConfig}
      />
    </div>
  );
};
