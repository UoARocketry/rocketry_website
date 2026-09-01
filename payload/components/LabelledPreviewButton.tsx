"use client";

import React from "react";
import { Button, useLivePreviewContext } from "@payloadcms/ui";

/**
 * Replaces Payload's default preview control, which renders as a bare 32x32
 * external-link icon with no text and is easy to miss entirely among the
 * Save Draft / Publish buttons.
 *
 * Reads the same `previewURL` the default does. That value comes from the
 * collection's `admin.preview`, so this renders nothing on collections that do
 * not define one.
 */
export function LabelledPreviewButton() {
  const { previewURL } = useLivePreviewContext();

  if (!previewURL) {
    return null;
  }

  return (
    <Button
      el="anchor"
      url={previewURL}
      newTab
      buttonStyle="secondary"
      size="medium"
      // No `tooltip` prop: Payload renders its text inline inside the button,
      // twice, which ends up in the accessible name.
      aria-label="Preview this page on the website, including unpublished changes"
    >
      Preview
    </Button>
  );
}
