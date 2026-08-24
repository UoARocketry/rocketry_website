import { getPayloadClient } from "../../lib/payload.ts";

/**
 * Supabase plan allowances, defaulting to the free tier as of 2026-08-25.
 *
 * These only scale the percentage bars — the byte figures beside them are
 * measured live and stay accurate regardless. If Supabase changes its tiers
 * (or the project moves to Pro), override without a code change by setting
 * SUPABASE_DATABASE_LIMIT_MB / SUPABASE_STORAGE_LIMIT_MB in the environment.
 *
 * @see https://supabase.com/pricing
 */
const DEFAULT_DATABASE_LIMIT_MB = 500;
const DEFAULT_STORAGE_LIMIT_MB = 1024;

function resolveLimitBytes(envValue: string | undefined, fallbackMb: number) {
  const parsed = Number(envValue?.trim());
  const megabytes = Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackMb;
  return megabytes * 1024 * 1024;
}

const DATABASE_LIMIT_BYTES = resolveLimitBytes(
  process.env.SUPABASE_DATABASE_LIMIT_MB,
  DEFAULT_DATABASE_LIMIT_MB,
);
const STORAGE_LIMIT_BYTES = resolveLimitBytes(
  process.env.SUPABASE_STORAGE_LIMIT_MB,
  DEFAULT_STORAGE_LIMIT_MB,
);

const SUPABASE_DASHBOARD_URL = "https://supabase.com/dashboard";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function toNumber(value: unknown): number {
  // pg returns bigint columns as strings to avoid precision loss.
  const parsed = typeof value === "string" ? Number(value) : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

type UsageStat = {
  label: string;
  used: number;
  limit: number;
  note: string;
};

function UsageBar({ label, used, limit, note }: UsageStat) {
  const percent = Math.min(100, (used / limit) * 100);
  const barColor =
    percent >= 90 ? "#e11d48" : percent >= 70 ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ flex: "1 1 260px", minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "0.5rem",
          marginBottom: "0.35rem",
        }}
      >
        <strong style={{ fontSize: "0.9rem" }}>{label}</strong>
        <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>
          {formatBytes(used)}
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: "var(--theme-elevation-100)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: barColor,
            borderRadius: 4,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
          marginTop: "0.35rem",
          fontSize: "0.75rem",
          opacity: 0.7,
        }}
      >
        <span>{note}</span>
        <span>
          {percent.toFixed(1)}% of {formatBytes(limit)}
        </span>
      </div>
    </div>
  );
}

export default async function StorageUsage() {
  let stats: UsageStat[] | null = null;
  let errorMessage: string | null = null;

  try {
    const payload = await getPayloadClient();
    const drizzle = (
      payload.db as unknown as {
        drizzle: { execute: (query: unknown) => Promise<{ rows: unknown[] }> };
      }
    ).drizzle;
    const { sql } = await import("@payloadcms/db-postgres");

    const [databaseResult, mediaResult] = await Promise.all([
      drizzle.execute(
        sql`SELECT pg_database_size(current_database()) AS bytes`,
      ),
      drizzle.execute(
        sql`SELECT COALESCE(SUM(filesize), 0) AS bytes FROM media`,
      ),
    ]);

    const databaseBytes = toNumber(
      (databaseResult.rows[0] as { bytes?: unknown } | undefined)?.bytes,
    );
    const mediaBytes = toNumber(
      (mediaResult.rows[0] as { bytes?: unknown } | undefined)?.bytes,
    );

    stats = [
      {
        label: "Database",
        used: databaseBytes,
        limit: DATABASE_LIMIT_BYTES,
        note: "Postgres, measured live",
      },
      {
        label: "Media storage",
        used: mediaBytes,
        limit: STORAGE_LIMIT_BYTES,
        note: "Sum of uploaded files",
      },
    ];
  } catch (error) {
    console.error("[admin/StorageUsage] Failed to read usage:", error);
    errorMessage = "Could not read usage figures from the database.";
  }

  return (
    <div
      style={{
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 8,
        padding: "1.25rem",
        marginBottom: "1.5rem",
      }}
    >
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Supabase usage</h3>

      {errorMessage ? (
        <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
          {errorMessage}
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
          {stats?.map((stat) => <UsageBar key={stat.label} {...stat} />)}
        </div>
      )}

      <p
        style={{
          margin: "1rem 0 0",
          fontSize: "0.75rem",
          opacity: 0.6,
          lineHeight: 1.5,
        }}
      >
        Media storage counts files tracked by the CMS, so anything uploaded to
        the bucket outside Payload is not included. Limits default to the free
        tier as of August 2026 and can be changed with the
        SUPABASE_DATABASE_LIMIT_MB / SUPABASE_STORAGE_LIMIT_MB environment
        variables —{" "}
        <a
          href={SUPABASE_DASHBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          check Supabase
        </a>{" "}
        for authoritative billing figures.
      </p>
    </div>
  );
}
