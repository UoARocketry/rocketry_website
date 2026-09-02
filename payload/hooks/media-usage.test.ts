import { describe, expect, it } from "vitest";
import {
  createMediaUsageDeleteHook,
  createMediaUsageHook,
  refreshMediaUsageFor,
} from "./media-usage.ts";

type FindArgs = { collection: string; where: unknown; req?: unknown };
type UpdateArgs = {
  collection: string;
  id: unknown;
  data: { usedIn?: string[] };
  req?: unknown;
};

/**
 * A stand-in for Payload's Local API that records what it was asked and, most
 * importantly, whether each call carried the request — the difference between
 * running inside the caller's transaction and opening a second connection
 * behind its back.
 */
function makePayloadStub(matches: Record<string, Record<string, unknown>[]>) {
  const finds: FindArgs[] = [];
  const updates: UpdateArgs[] = [];
  const globals: { slug: string; req?: unknown }[] = [];

  const payload = {
    find: async (args: FindArgs) => {
      finds.push(args);
      const docs = matches[args.collection] ?? [];
      return { docs, totalDocs: docs.length };
    },
    update: async (args: UpdateArgs) => {
      updates.push(args);
      return {};
    },
    findGlobal: async (args: { slug: string; req?: unknown }) => {
      globals.push(args);
      return {};
    },
  };

  const req = { payload } as never;
  return { req, finds, updates, globals };
}

/** Every Local API call a hook makes must be bound to the request. */
function expectAllCallsJoinTransaction(stub: ReturnType<typeof makePayloadStub>) {
  for (const call of [...stub.finds, ...stub.updates, ...stub.globals]) {
    expect(call.req).toBe(stub.req);
  }
}

describe("createMediaUsageHook", () => {
  it("runs every query inside the caller's transaction", async () => {
    const stub = makePayloadStub({ rockets: [{ imageMedia: 41 }] });
    const hook = createMediaUsageHook(["imageMedia", "gallery"]);

    await hook({
      doc: { imageMedia: 41 },
      previousDoc: {},
      req: stub.req,
      context: {},
    } as never);

    expect(stub.finds.length).toBeGreaterThan(0);
    expect(stub.updates.length).toBeGreaterThan(0);
    expectAllCallsJoinTransaction(stub);
  });

  it("queries each collection once however many images changed", async () => {
    const gallery = [43, 44, 45];
    const stub = makePayloadStub({
      rockets: [{ imageMedia: 41, gallery }],
    });
    const hook = createMediaUsageHook(["imageMedia", "gallery"]);

    await hook({
      doc: { imageMedia: 41, gallery },
      previousDoc: {},
      req: stub.req,
      context: {},
    } as never);

    // Four images, six collections that can hold one. One query each, not
    // eight per image — the round-trip storm is what stalled the transaction.
    const perCollection = new Set(stub.finds.map((find) => find.collection));
    expect(stub.finds).toHaveLength(perCollection.size);
    expect(stub.globals).toHaveLength(1);
    expect(stub.updates.map((update) => update.id).sort()).toEqual([
      41, 43, 44, 45,
    ]);
  });

  it("records the collections an image is used by", async () => {
    const stub = makePayloadStub({
      rockets: [{ imageMedia: 41 }],
      events: [{ imageMedia: 41 }],
    });
    const hook = createMediaUsageHook(["imageMedia"]);

    await hook({
      doc: { imageMedia: 41 },
      previousDoc: {},
      req: stub.req,
      context: {},
    } as never);

    expect(stub.updates).toHaveLength(1);
    expect(stub.updates[0].data.usedIn).toEqual(["events", "rockets"]);
  });

  it("clears the image that was swapped out as well as the one chosen", async () => {
    const stub = makePayloadStub({ rockets: [{ imageMedia: 41 }] });
    const hook = createMediaUsageHook(["imageMedia"]);

    await hook({
      doc: { imageMedia: 41 },
      previousDoc: { imageMedia: 39 },
      req: stub.req,
      context: {},
    } as never);

    const cleared = stub.updates.find((update) => update.id === 39);
    expect(cleared?.data.usedIn).toEqual([]);
  });

  it("does nothing when re-entered by its own media write", async () => {
    const stub = makePayloadStub({ rockets: [{ imageMedia: 41 }] });
    const hook = createMediaUsageHook(["imageMedia"]);

    await hook({
      doc: { imageMedia: 41 },
      previousDoc: {},
      req: stub.req,
      context: { skipUsageRefresh: true },
    } as never);

    expect(stub.finds).toHaveLength(0);
    expect(stub.updates).toHaveLength(0);
  });

  it("surfaces a failure rather than leaving a dead transaction to commit", async () => {
    const stub = makePayloadStub({ rockets: [{ imageMedia: 41 }] });
    (stub.req as unknown as { payload: { update: unknown } }).payload.update =
      async () => {
        throw new Error("deadlock detected");
      };
    const hook = createMediaUsageHook(["imageMedia"]);

    await expect(
      hook({
        doc: { imageMedia: 41 },
        previousDoc: {},
        req: stub.req,
        context: {},
      } as never),
    ).rejects.toThrow("deadlock detected");
  });

  it("skips the work entirely when no image is attached", async () => {
    const stub = makePayloadStub({});
    const hook = createMediaUsageHook(["imageMedia"]);

    await hook({
      doc: {},
      previousDoc: {},
      req: stub.req,
      context: {},
    } as never);

    expect(stub.finds).toHaveLength(0);
    expect(stub.updates).toHaveLength(0);
  });
});

describe("createMediaUsageDeleteHook", () => {
  it("runs inside the caller's transaction", async () => {
    const stub = makePayloadStub({});
    const hook = createMediaUsageDeleteHook(["imageMedia"]);

    await hook({ doc: { imageMedia: 41 }, req: stub.req } as never);

    expect(stub.updates).toHaveLength(1);
    expectAllCallsJoinTransaction(stub);
  });
});

describe("refreshMediaUsageFor", () => {
  it("takes the request, not a bare payload client", async () => {
    const stub = makePayloadStub({});

    await refreshMediaUsageFor(stub.req, [{ id: 41 }, null, undefined]);

    expect(stub.updates.map((update) => update.id)).toEqual([41]);
    expectAllCallsJoinTransaction(stub);
  });
});
