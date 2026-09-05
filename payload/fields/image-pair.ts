import type { Field } from "payload";
import { fieldHelp } from "./help.ts";
import {
  urlFieldHooks,
  validateOptionalUrl,
  validateUrlOrUpload,
} from "./validators.ts";

/**
 * Adds a drag-to-position, zoom-to-reframe control for images the site crops
 * to fill a frame. Only worth asking for where the frame actually crops — on a
 * `object-contain` frame the whole image is shown and framing does nothing.
 */
export type ImageFramingOptions = {
  /** Name of the text field holding the framing value, e.g. "imagePosition". */
  name: string;
  /** Shape of the admin preview, matching how the site frames this image. */
  shape: "circle" | "rect";
  /** Width ÷ height of the site's frame, used to size the preview box. */
  aspect: number;
  /** Overrides the default "Image position" label. */
  label?: string;
  /** Names where this framing applies, e.g. "the rocket cards". */
  appliesTo?: string;
};

type ImagePairOptions = {
  /** Name of the `upload` relation field, e.g. "photoMedia". */
  uploadName: string;
  /** Name of the flattened public-URL text field, e.g. "photo". */
  urlName: string;
  /**
   * Human label for the field, e.g. "Photo". Used for the upload field itself,
   * for the URL field beside it, and in validation messages.
   */
  label: string;
  /** Whether an image must be supplied at all. */
  required: boolean;
  /** Extra guidance appended to the upload field's description. */
  uploadDescription?: string;
  /** Omit entirely for an image the site never crops. */
  framing?: ImageFramingOptions;
};

/**
 * The upload-plus-flattened-URL pair used by every image on the site.
 *
 * The URL field only appears when no file has been chosen. Showing both at once
 * means explaining in prose which one wins on save, so the condition removes
 * the choice instead: upload a file, or reveal the field and paste a link.
 *
 * The URL field still holds the value the frontend reads; it is populated by
 * `createMediaRelationUrlSyncHook` on save.
 */
export function createImagePairFields({
  uploadName,
  urlName,
  label,
  required,
  uploadDescription,
  framing,
}: ImagePairOptions): Field[] {
  const baseDescription = `Upload a new image or pick one already in the Media library.${
    required ? "" : " Optional."
  }`;

  const framingFields: Field[] = framing
    ? [
        {
          name: framing.name,
          type: "text",
          label: framing.label ?? "Image position",
          required: false,
          // Anything already in the database keeps the centred crop it has
          // been rendering with, so adding the control moves nothing.
          defaultValue: "50% 50%",
          admin: {
            // The URL field is only filled in by the beforeChange hook, so a
            // just-picked file has the relation set and the URL still empty.
            // Checking both keeps the control visible before the first save.
            condition: (_data, siblingData) => {
              const siblings = siblingData as
                | Record<string, unknown>
                | undefined;
              return Boolean(siblings?.[urlName] || siblings?.[uploadName]);
            },
            components: {
              Field: {
                path: "/payload/components/PhotoPositionField.tsx",
                exportName: "PhotoPositionField",
                clientProps: {
                  uploadField: uploadName,
                  urlField: urlName,
                  shape: framing.shape,
                  aspect: framing.aspect,
                  appliesTo: framing.appliesTo,
                },
              },
            },
          },
        },
      ]
    : [];

  return [
    {
      name: uploadName,
      type: "upload",
      // Without this Payload titles the field from the variable name, so the
      // field an editor uses nearly every time read "Image Media" / "Photo
      // Media" / "Logo Media", while the fallback field beside it was properly
      // labelled. The better name belonged on the primary control.
      label,
      relationTo: "media" as never,
      required: false,
      // The generic instruction stays on screen and the collection's own
      // advice moves behind the toggle. Concatenating the two ran to 208
      // characters on Sponsors, which is a paragraph sitting above an upload
      // box you already know how to use.
      admin: fieldHelp(baseDescription, uploadDescription),
    },
    {
      name: urlName,
      type: "text",
      label: `${label} URL`,
      // `required` drives the asterisk only: supplying a custom `validate`
      // replaces Payload's built-in required check entirely.
      required,
      admin: {
        // Hidden entirely once a file is chosen, because the save hook
        // overwrites whatever is typed here with the uploaded file's URL.
        condition: (_data, siblingData) =>
          !(siblingData as Record<string, unknown> | undefined)?.[uploadName],
        description: `Only needed if you are linking an image hosted somewhere else instead of uploading one. Choose a file above and this disappears.`,
      },
      hooks: urlFieldHooks,
      validate: required
        ? (value: unknown, { siblingData }: { siblingData: unknown }) =>
            validateUrlOrUpload(value, siblingData, uploadName, label)
        : (value: unknown) => validateOptionalUrl(value, `${label} URL`),
    },
    ...framingFields,
  ];
}
