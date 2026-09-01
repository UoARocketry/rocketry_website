import type { Field } from "payload";
import { validateOptionalUrl, validateUrlOrUpload } from "./validators.ts";

type ImagePairOptions = {
  /** Name of the `upload` relation field, e.g. "photoMedia". */
  uploadName: string;
  /** Name of the flattened public-URL text field, e.g. "photo". */
  urlName: string;
  /** Human label used in validation messages, e.g. "Photo". */
  label: string;
  /** Whether an image must be supplied at all. */
  required: boolean;
  /** Extra guidance appended to the upload field's description. */
  uploadDescription?: string;
};

/**
 * The upload-plus-flattened-URL pair used by every image on the site.
 *
 * The URL field only appears when no file has been chosen. Previously both
 * were always visible, each carrying a paragraph explaining that saving would
 * overwrite one with the other, which was the most repeated source of
 * confusion in the admin. Collapsing it to "upload a file, or reveal the field
 * and paste a link" removes the choice rather than explaining it.
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
}: ImagePairOptions): Field[] {
  const baseDescription = `Upload a new image or pick one already in the Media library.${
    required ? "" : " Optional."
  }`;

  return [
    {
      name: uploadName,
      type: "upload",
      relationTo: "media" as never,
      required: false,
      admin: {
        description: uploadDescription
          ? `${baseDescription} ${uploadDescription}`
          : baseDescription,
      },
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
      validate: required
        ? (value: unknown, { siblingData }: { siblingData: unknown }) =>
            validateUrlOrUpload(value, siblingData, uploadName, label)
        : (value: unknown) => validateOptionalUrl(value, `${label} URL`),
    },
  ];
}
