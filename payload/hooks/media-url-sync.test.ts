import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  isAbsoluteUrl,
  syncMediaRelationToUrlField,
} from "./media-url-sync.ts";

describe("isAbsoluteUrl", () => {
  it("accepts http and https", () => {
    expect(isAbsoluteUrl("https://example.com/a.jpg")).toBe(true);
    expect(isAbsoluteUrl("http://example.com/a.jpg")).toBe(true);
  });

  it("rejects the relative path Payload reports when S3 storage is disabled", () => {
    expect(isAbsoluteUrl("/api/media/file/Headshot.jpg")).toBe(false);
    expect(isAbsoluteUrl("api/media/file/Headshot.jpg")).toBe(false);
  });
});

/** Minimal stand-in for the Payload request the hook reaches through. */
function makeReq(mediaDoc: Record<string, unknown>) {
  return {
    payload: {
      findByID: async () => mediaDoc,
    },
  } as never;
}

describe("syncMediaRelationToUrlField", () => {
  const ORIGINAL_ENV = process.env.SUPABASE_STORAGE_PUBLIC_URL;

  beforeEach(() => {
    delete process.env.SUPABASE_STORAGE_PUBLIC_URL;
  });

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) {
      delete process.env.SUPABASE_STORAGE_PUBLIC_URL;
    } else {
      process.env.SUPABASE_STORAGE_PUBLIC_URL = ORIGINAL_ENV;
    }
  });

  it("keeps the existing Supabase URL when storage is unconfigured", async () => {
    // Reproduces the incident: publishing from a local dev server, where the
    // media doc's url is relative, must not clobber a good production URL.
    const good = "https://x.supabase.co/storage/v1/object/public/images/a.jpg";
    const data: Record<string, unknown> = { photoMedia: 7 };

    await syncMediaRelationToUrlField({
      data,
      originalDoc: { photoMedia: 7, photo: good },
      req: makeReq({ id: 7, url: "/api/media/file/a.jpg", filename: "a.jpg" }),
      relationField: "photoMedia",
      urlField: "photo",
    });

    expect(data.photo).toBe(good);
  });

  it("keeps the existing URL when the configured storage base is not absolute", async () => {
    // Same failure as an unset base, reached the other way: a relative
    // SUPABASE_STORAGE_PUBLIC_URL would otherwise be concatenated into a
    // relative URL and written into the field the public site reads.
    process.env.SUPABASE_STORAGE_PUBLIC_URL = "images";
    const good = "https://x.supabase.co/storage/v1/object/public/images/a.jpg";
    const data: Record<string, unknown> = { photoMedia: 7 };

    await syncMediaRelationToUrlField({
      data,
      originalDoc: { photoMedia: 7, photo: good },
      req: makeReq({ id: 7, filename: "a.jpg", prefix: "media" }),
      relationField: "photoMedia",
      urlField: "photo",
    });

    expect(data.photo).toBe(good);
  });

  it("rebuilds the public URL from the filename when storage is configured", async () => {
    process.env.SUPABASE_STORAGE_PUBLIC_URL =
      "https://x.supabase.co/storage/v1/object/public/images";
    const data: Record<string, unknown> = { photoMedia: 7 };

    await syncMediaRelationToUrlField({
      data,
      originalDoc: { photoMedia: 7, photo: "https://old.example.com/old.jpg" },
      req: makeReq({
        id: 7,
        url: "/api/media/file/a.jpg",
        filename: "a.jpg",
        prefix: "media",
      }),
      relationField: "photoMedia",
      urlField: "photo",
    });

    expect(data.photo).toBe(
      "https://x.supabase.co/storage/v1/object/public/images/media/a.jpg",
    );
  });

  it("uses an absolute url from the media doc as-is", async () => {
    const absolute = "https://x.supabase.co/storage/v1/object/public/images/a.jpg";
    const data: Record<string, unknown> = { photoMedia: 7 };

    await syncMediaRelationToUrlField({
      data,
      originalDoc: {},
      req: makeReq({ id: 7, url: absolute, filename: "a.jpg" }),
      relationField: "photoMedia",
      urlField: "photo",
    });

    expect(data.photo).toBe(absolute);
  });

  it("clears the url when the relation is cleared", async () => {
    const data: Record<string, unknown> = { photoMedia: null };

    await syncMediaRelationToUrlField({
      data,
      originalDoc: { photoMedia: 7, photo: "https://x.supabase.co/a.jpg" },
      req: makeReq({}),
      relationField: "photoMedia",
      urlField: "photo",
    });

    expect(data.photo).toBeNull();
  });
});
