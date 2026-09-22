import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import type { Throttle } from "@/lib/auth/config";

export type HitResult = { allowed: boolean; count: number; retryAfterSeconds: number };

/** Keys never contain raw emails: identifiers are hashed before being stored. */
export function limitKey(scope: string, ...parts: string[]) {
  const digest = createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 32);
  return `${scope}:${digest}`;
}

type Row = { count: number; retry_after: number };

/**
 * Atomically counts one event in a fixed window. A single upsert keeps the
 * counter correct under concurrent requests and across server instances.
 */
export async function hit(key: string, { limit, windowSeconds }: Throttle): Promise<HitResult> {
  const rows = await prisma.$queryRaw<Row[]>`
    INSERT INTO "RateLimit" ("key", "count", "windowStart", "expiresAt")
    VALUES (${key}, 1, timezone('utc', now()), timezone('utc', now()) + make_interval(secs => ${windowSeconds}::float8))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."expiresAt" <= timezone('utc', now()) THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."expiresAt" <= timezone('utc', now()) THEN timezone('utc', now()) ELSE "RateLimit"."windowStart" END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" <= timezone('utc', now()) THEN timezone('utc', now()) + make_interval(secs => ${windowSeconds}::float8) ELSE "RateLimit"."expiresAt" END
    RETURNING "count", EXTRACT(EPOCH FROM ("expiresAt" - timezone('utc', now())))::float8 AS "retry_after"`;
  const row = rows[0];
  if (!row) throw new Error("rate limit upsert returned no row");
  return {
    allowed: row.count <= limit,
    count: row.count,
    retryAfterSeconds: Math.max(1, Math.ceil(row.retry_after)),
  };
}

/** Read-only check: is this key already over its limit in the current window? */
export async function peek(key: string, { limit }: Throttle): Promise<HitResult> {
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT "count", EXTRACT(EPOCH FROM ("expiresAt" - timezone('utc', now())))::float8 AS "retry_after"
    FROM "RateLimit"
    WHERE "key" = ${key} AND "expiresAt" > timezone('utc', now())`;
  const row = rows[0];
  if (!row) return { allowed: true, count: 0, retryAfterSeconds: 0 };
  return {
    allowed: row.count < limit,
    count: row.count,
    retryAfterSeconds: Math.max(1, Math.ceil(row.retry_after)),
  };
}

export async function reset(key: string) {
  await prisma.rateLimit.deleteMany({ where: { key } });
}
