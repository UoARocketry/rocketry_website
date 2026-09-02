import type { Field } from "payload";
import { urlFieldHooks, validateRequiredUrl } from "./validators.ts";

type LinkListOptions = {
  /** Field name for the list itself, e.g. "links" or "videos". */
  name: string;
  /** Field name holding the section heading, e.g. "linksHeading". */
  headingName: string;
  /** Shown as the section title when the heading is left empty. */
  defaultHeading: string;
  singular: string;
  plural: string;
  description: string;
  headingDescription: string;
  labelPlaceholder: string;
};

/**
 * A titled list of labelled links.
 *
 * Used for both a rocket's videos and the general resource links on rockets
 * and events. They render as the same kind of section and differ only in their
 * icon, so they are declared the same way rather than drifting apart.
 *
 * The heading has no `defaultValue`: an empty field falls back at render time,
 * which keeps a row saved before this existed identical to one an editor
 * simply left alone.
 */
export function createLinkListFields({
  name,
  headingName,
  defaultHeading,
  singular,
  plural,
  description,
  headingDescription,
  labelPlaceholder,
}: LinkListOptions): Field[] {
  return [
    {
      name: headingName,
      type: "text",
      label: `${plural} heading`,
      required: false,
      admin: {
        placeholder: defaultHeading,
        description: headingDescription,
        condition: (_data, siblingData) => {
          const rows = (siblingData as Record<string, unknown> | undefined)?.[
            name
          ];
          // Pointless to ask for a heading for a section with nothing in it.
          return Array.isArray(rows) && rows.length > 0;
        },
      },
    },
    {
      name,
      type: "array",
      required: false,
      labels: { singular, plural },
      admin: { initCollapsed: true, description },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          admin: {
            placeholder: labelPlaceholder,
            description: "What the link says on the page.",
          },
        },
        {
          name: "url",
          type: "text",
          required: true,
          hooks: urlFieldHooks,
          validate: (value: unknown) => validateRequiredUrl(value, "URL"),
        },
      ],
    },
  ];
}
