import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  SESSION_ABSOLUTE_SECONDS,
  SESSION_IDLE_SECONDS,
  SESSION_ROTATION_GRACE_SECONDS,
  SESSION_TOUCH_INTERVAL_SECONDS,
} from "@/lib/auth/config";
import { randomToken, tokenHash } from "@/lib/auth/crypto";
import { isPermission, type Permission } from "@/lib/auth/rbac/catalog";
import type { AuthUser } from "@/lib/auth/types";

/**
 * Database side of sessions. No request/cookie handling here so scripts and
 * services can use it. Tokens are opaque 256-bit values; only hashes are stored.
 */

const userInclude = {
  roles: {
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  },
} satisfies Prisma.UserInclude;

type UserWithRbac = Prisma.UserGetPayload<{ include: typeof userInclude }>;

const ms = (seconds: number) => seconds * 1000;

export type Db = Prisma.TransactionClient | typeof prisma;

export function toAuthUser(user: UserWithRbac): AuthUser {
  const permissions = new Set<Permission>();
  for (const { role } of user.roles) {
    for (const { permission } of role.permissions) {
      const key = `${permission.resource}:${permission.action}`;
      if (isPermission(key)) permissions.add(key);
    }
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles.map(({ role }) => role.code).sort(),
    permissions: [...permissions].sort(),
  };
}

export async function loadAuthUser(userId: string, db: Db = prisma): Promise<AuthUser | null> {
  const user = await db.user.findUnique({ where: { id: userId }, include: userInclude });
  return user?.isActive ? toAuthUser(user) : null;
}

export type NewSession = { token: string; csrfToken: string; expiresAt: Date; id: string };

export async function createSession(
  userId: string,
  client: { ipAddress: string; userAgent: string | null },
  db: Db = prisma,
): Promise<NewSession> {
  const token = randomToken();
  const csrfToken = randomToken();
  const expiresAt = new Date(Date.now() + ms(SESSION_ABSOLUTE_SECONDS));
  const row = await db.session.create({
    data: {
      userId,
      tokenHash: tokenHash(token),
      csrfTokenHash: tokenHash(csrfToken),
      expiresAt,
      userAgent: client.userAgent,
      ipAddress: client.ipAddress,
    },
    select: { id: true },
  });
  return { token, csrfToken, expiresAt, id: row.id };
}

export type ResolvedSession = {
  session: {
    id: string;
    csrfTokenHash: string;
    expiresAt: Date;
    rotatedAt: Date;
    userId: string;
  };
  user: AuthUser;
  /** True when the caller presented the pre-rotation token (inside the grace window). */
  viaPreviousToken: boolean;
};

/**
 * Resolves a raw session token to a live session + user, or null. A session is
 * dead if it is unknown, revoked, past its absolute expiry, idle too long, or
 * its account is deactivated.
 */
export async function resolveSession(token: string): Promise<ResolvedSession | null> {
  const hash = tokenHash(token);
  const now = new Date();
  const session = await prisma.session.findFirst({
    where: {
      OR: [{ tokenHash: hash }, { previousTokenHash: hash, previousValidUntil: { gt: now } }],
    },
    include: { user: { include: userInclude } },
  });
  if (!session || session.revokedAt) return null;
  if (session.expiresAt <= now) return null;
  if (session.lastSeenAt.getTime() + ms(SESSION_IDLE_SECONDS) <= now.getTime()) return null;
  if (!session.user.isActive) return null;

  if (now.getTime() - session.lastSeenAt.getTime() > ms(SESSION_TOUCH_INTERVAL_SECONDS)) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastSeenAt: now } })
      .catch((error) => console.error("[session] lastSeenAt update failed", error));
  }

  return {
    session: {
      id: session.id,
      csrfTokenHash: session.csrfTokenHash,
      expiresAt: session.expiresAt,
      rotatedAt: session.rotatedAt,
      userId: session.userId,
    },
    user: toAuthUser(session.user),
    viaPreviousToken: session.tokenHash !== hash,
  };
}

/**
 * Issues a fresh token for a live session. Compare-and-swap on the current
 * hash, so two concurrent rotations cannot both win. The old token remains
 * valid for a short grace window.
 */
export async function rotateSessionToken(sessionId: string, currentToken: string) {
  const token = randomToken();
  const now = new Date();
  const { count } = await prisma.session.updateMany({
    where: { id: sessionId, tokenHash: tokenHash(currentToken), revokedAt: null },
    data: {
      previousTokenHash: tokenHash(currentToken),
      previousValidUntil: new Date(now.getTime() + ms(SESSION_ROTATION_GRACE_SECONDS)),
      tokenHash: tokenHash(token),
      rotatedAt: now,
    },
  });
  return count === 1 ? token : null;
}

export async function rotateCsrfToken(sessionId: string, db: Db = prisma) {
  const csrfToken = randomToken();
  await db.session.update({
    where: { id: sessionId },
    data: { csrfTokenHash: tokenHash(csrfToken) },
  });
  return csrfToken;
}

export async function revokeSession(sessionId: string, reason: string, db: Db = prisma) {
  await db.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
}

export async function revokeSessionByToken(token: string, reason: string) {
  const hash = tokenHash(token);
  await prisma.session.updateMany({
    where: { OR: [{ tokenHash: hash }, { previousTokenHash: hash }], revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
}

/** Revokes every live session for a user (optionally keeping one). Returns how many. */
export async function revokeUserSessions(
  userId: string,
  reason: string,
  options: { exceptSessionId?: string } = {},
  db: Db = prisma,
) {
  const { count } = await db.session.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(options.exceptSessionId ? { id: { not: options.exceptSessionId } } : {}),
    },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
  return count;
}
