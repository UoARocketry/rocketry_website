type EnvRecord = Record<string, string | undefined>;

const DEV_PAYLOAD_SECRET = "dev-only-secret-change-before-production";

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

export function isProductionRuntime(env: EnvRecord = process.env): boolean {
  return (
    env.NODE_ENV === "production" &&
    env.NEXT_PHASE !== "phase-production-build"
  );
}

export function resolveDatabaseUrl(env: EnvRecord = process.env): string {
  const url = (env.DIRECT_URL || env.DATABASE_URL || "").trim();
  if (!url) {
    throw new Error(
      "Missing database connection string. Set DIRECT_URL or DATABASE_URL.",
    );
  }
  return url;
}

export function resolvePayloadSecret(env: EnvRecord = process.env): string {
  const secret = (env.PAYLOAD_SECRET || "").trim();
  if (secret) {
    return secret;
  }
  if (isProductionRuntime(env)) {
    throw new Error(
      "PAYLOAD_SECRET is required in production. Refusing to boot with an insecure default.",
    );
  }
  return DEV_PAYLOAD_SECRET;
}

export function resolveServerUrl(env: EnvRecord = process.env): string | undefined {
  const serverUrl = (env.SERVER_URL || "").trim();
  return serverUrl ? trimTrailingSlashes(serverUrl) : undefined;
}

export function buildAllowedOrigins(env: EnvRecord = process.env): string[] {
  const origins = new Set<string>();
  const serverUrl = resolveServerUrl(env);
  if (serverUrl) {
    origins.add(serverUrl);
  }
  if (env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
  }
  return Array.from(origins);
}
