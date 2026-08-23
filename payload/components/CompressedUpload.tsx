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

  useEffect(() => {
    if (!(value instanceof File)) return;
    if (processedFiles.current.has(value)) return;
    if (!COMPRESSIBLE_TYPES.has(value.type)) return;
    if (value.size < MIN_SIZE_TO_COMPRESS_BYTES) return;

    let cancelled = false;

    (async () => {
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
      {isCompressing && (
        <div style={{ marginBottom: "0.5rem", fontSize: "13px", opacity: 0.75 }}>
          Compressing image…
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
