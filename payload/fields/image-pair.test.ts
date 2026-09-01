import { describe, expect, it } from "vitest";
import type { Field } from "payload";
import { createImagePairFields } from "./image-pair.ts";

const base = {
  uploadName: "imageMedia",
  urlName: "image",
  label: "Rocket image",
  required: true,
};

function fieldNames(fields: Field[]): string[] {
  return fields.map((field) => ("name" in field ? field.name : ""));
}

function findField(fields: Field[], name: string) {
  const match = fields.find(
    (field) => "name" in field && field.name === name,
  ) as Record<string, unknown> | undefined;

  if (!match) throw new Error(`No field named ${name}`);
  return match;
}

/** The `admin` block, loosened so tests can read into custom component config. */
function adminOf(field: Record<string, unknown>): Record<string, unknown> {
  return (field.admin ?? {}) as Record<string, unknown>;
}

/** Calls a field's `condition` with just the args a sibling-driven one uses. */
function conditionOf(field: Record<string, unknown>) {
  const condition = adminOf(field).condition as (
    data: unknown,
    siblingData: unknown,
  ) => boolean;

  return (siblingData: unknown) => condition({}, siblingData);
}

function clientPropsOf(field: Record<string, unknown>): Record<string, unknown> {
  const components = adminOf(field).components as Record<string, unknown>;
  const fieldComponent = components.Field as Record<string, unknown>;
  return fieldComponent.clientProps as Record<string, unknown>;
}

describe("createImagePairFields", () => {
  it("emits just the upload and URL fields when no framing is asked for", () => {
    expect(fieldNames(createImagePairFields(base))).toEqual([
      "imageMedia",
      "image",
    ]);
  });

  it("appends the framing field after the image fields when asked for", () => {
    const fields = createImagePairFields({
      ...base,
      framing: { name: "imagePosition", shape: "rect", aspect: 1.5 },
    });

    expect(fieldNames(fields)).toEqual([
      "imageMedia",
      "image",
      "imagePosition",
    ]);
  });

  it("defaults framing to centred so existing documents do not move", () => {
    const fields = createImagePairFields({
      ...base,
      framing: { name: "imagePosition", shape: "rect", aspect: 1.5 },
    });

    expect(findField(fields, "imagePosition").defaultValue).toBe("50% 50%");
  });

  it("hides the framing control until an image has been chosen", () => {
    const fields = createImagePairFields({
      ...base,
      framing: { name: "imagePosition", shape: "rect", aspect: 1.5 },
    });

    expect(conditionOf(findField(fields, "imagePosition"))({})).toBe(false);
  });

  it("shows the framing control on a freshly picked file, before the URL hook has run", () => {
    // `image` is only filled in by a beforeChange hook, so a just-uploaded
    // file has the relation set and the URL still empty. Keying the condition
    // on the URL alone left the control hidden until after the first save.
    const fields = createImagePairFields({
      ...base,
      framing: { name: "imagePosition", shape: "rect", aspect: 1.5 },
    });

    expect(conditionOf(findField(fields, "imagePosition"))({ imageMedia: 7 })).toBe(
      true,
    );
  });

  it("tells the preview component which fields hold the image and what shape the frame is", () => {
    const fields = createImagePairFields({
      ...base,
      framing: { name: "imagePosition", shape: "circle", aspect: 1 },
    });

    expect(clientPropsOf(findField(fields, "imagePosition"))).toMatchObject({
      uploadField: "imageMedia",
      urlField: "image",
      shape: "circle",
      aspect: 1,
    });
  });
});
