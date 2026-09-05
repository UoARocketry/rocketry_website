import "server-only";
import { getPayload } from "payload";
import config from "@payload-config";

let payloadPromise: ReturnType<typeof getPayload> | null = null;

export function getPayloadClient() {
  if (!payloadPromise) {
    // Payload clears its own cached init promise when init fails, so that a
    // later call can retry. Caching the promise here without doing the same
    // would defeat that: one transient failure (a database blip on a cold
    // start) would be memoised and every later request served by this instance
    // would replay the same rejection until the process was recycled.
    payloadPromise = getPayload({ config }).catch((error) => {
      payloadPromise = null;
      throw error;
    });
  }

  return payloadPromise;
}
