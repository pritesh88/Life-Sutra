import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import type { Throttle } from "@/lib/auth/config";

export type HitResult = { allowed: boolean; count: number; retryAfterSeconds: number };

/** Keys never contain raw emails: identifiers are hashed before being stored. */
export function limitKey(scope: string, ...parts: string[]) {
  const digest = createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 32);
  return `${scope}:${digest}`;
}

/**
 * Counts one event in a fixed window. Clearing an expired window and upserting
 * the counter run in one transaction; SQLite/libSQL serialises writers, so the
 * counter stays correct under concurrent requests and across server instances.
 */
export async function hit(key: string, { limit, windowSeconds }: Throttle): Promise<HitResult> {
  const now = new Date();
  const [, row] = await prisma.$transaction([
    prisma.rateLimit.deleteMany({ where: { key, expiresAt: { lte: now } } }),
    prisma.rateLimit.upsert({
      where: { key },
      create: {
        key,
        count: 1,
        windowStart: now,
        expiresAt: new Date(now.getTime() + windowSeconds * 1000),
      },
      update: { count: { increment: 1 } },
    }),
  ]);
  return {
    allowed: row.count <= limit,
    count: row.count,
    retryAfterSeconds: retryAfter(row.expiresAt, now),
  };
}

/** Read-only check: is this key already over its limit in the current window? */
export async function peek(key: string, { limit }: Throttle): Promise<HitResult> {
  const now = new Date();
  const row = await prisma.rateLimit.findFirst({ where: { key, expiresAt: { gt: now } } });
  if (!row) return { allowed: true, count: 0, retryAfterSeconds: 0 };
  return {
    allowed: row.count < limit,
    count: row.count,
    retryAfterSeconds: retryAfter(row.expiresAt, now),
  };
}

function retryAfter(expiresAt: Date, now: Date) {
  return Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
}

export async function reset(key: string) {
  await prisma.rateLimit.deleteMany({ where: { key } });
}
