import { Prisma } from "@prisma/client";
import { HttpError, tooManyRequests } from "@/lib/api/errors";
import { AuditEvent, audit, auditIn } from "@/lib/auth/audit";
import { PASSWORD_RESET_TTL_SECONDS, THROTTLE } from "@/lib/auth/config";
import {
  hashPassword,
  passwordNeedsRehash,
  randomToken,
  tokenHash,
  verifyPassword,
  verifyPasswordOrBurn,
} from "@/lib/auth/crypto";
import { hit, limitKey, peek, reset } from "@/lib/auth/rate-limit";
import { DEFAULT_REGISTRATION_ROLES } from "@/lib/auth/rbac/catalog";
import {
  createSession,
  loadAuthUser,
  revokeSessionByToken,
  revokeUserSessions,
  type NewSession,
} from "@/lib/auth/session-store";
import type { AuthUser } from "@/lib/auth/types";
import { passwordPolicyViolation } from "@/lib/auth/validation";
import { prisma } from "@/lib/db";
import type { ClientInfo } from "@/lib/http/client-info";
import { sendMail } from "@/lib/mail";
import { getSiteUrl } from "@/lib/site";

/**
 * Authentication service: the only place that touches password hashes and
 * mints sessions. Route handlers stay thin; UI never sees any of this.
 */

export type AuthResult = { user: AuthUser; session: NewSession };

const GENERIC_LOGIN_ERROR = "Invalid email or password.";

function requireAllowed(result: { allowed: boolean; retryAfterSeconds: number }) {
  if (!result.allowed) throw tooManyRequests(result.retryAfterSeconds);
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export async function registerAccount(
  input: { name: string; email: string; password: string },
  client: ClientInfo,
): Promise<AuthResult> {
  requireAllowed(await hit(limitKey("register:ip", client.ipAddress), THROTTLE.registerIp));

  const roles = await prisma.role.findMany({
    where: { code: { in: [...DEFAULT_REGISTRATION_ROLES] } },
    select: { id: true, code: true },
  });
  if (roles.length !== DEFAULT_REGISTRATION_ROLES.length) {
    console.error("[auth] default roles are missing; run `npm run db:seed`");
    throw new HttpError(503, "Registration is temporarily unavailable.");
  }

  const passwordHash = await hashPassword(input.password);
  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          // Roles come from server configuration only — never from the request.
          roles: {
            create: roles.map(({ id }) => ({ roleId: id, assignedBy: "self-registration" })),
          },
        },
        select: { id: true },
      });
      await auditIn(tx, client, AuditEvent.Registered, {
        actorId: created.id,
        targetType: "User",
        targetId: created.id,
        metadata: { roles: roles.map(({ code }) => code).join(",") },
      });
      return created;
    });
    const session = await createSession(user.id, client);
    const authUser = await loadAuthUser(user.id);
    if (!authUser) throw new Error("newly registered user could not be loaded");
    return { user: authUser, session };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      await audit(client, AuditEvent.RegisterFailed, {
        outcome: "FAILURE",
        metadata: { reason: "duplicate_email" },
      });
      throw new HttpError(409, "An account with that email already exists.");
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function loginWithPassword(
  input: { email: string; password: string },
  client: ClientInfo,
  /** The raw session cookie the browser sent, if any — revoked to prevent fixation. */
  presentedSessionToken?: string,
): Promise<AuthResult> {
  const identityKey = limitKey("login:identity", client.ipAddress, input.email);
  const emailKey = limitKey("login:email", input.email);

  requireAllowed(await hit(limitKey("login:ip", client.ipAddress), THROTTLE.loginIp));
  requireAllowed(await peek(identityKey, THROTTLE.loginIdentity));
  requireAllowed(await peek(emailKey, THROTTLE.loginEmail));

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const usable = user?.isActive ? user : null;
  // Always spend one argon2 verification, whether or not the account exists.
  const valid = await verifyPasswordOrBurn(usable?.passwordHash ?? null, input.password);

  if (!user || !usable || !valid) {
    const identity = await hit(identityKey, THROTTLE.loginIdentity);
    await hit(emailKey, THROTTLE.loginEmail);
    await audit(client, AuditEvent.LoginFailed, {
      actorId: user?.id ?? null,
      outcome: "FAILURE",
      metadata: {
        email: input.email,
        reason: !user ? "unknown_account" : !user.isActive ? "inactive_account" : "bad_password",
      },
    });
    if (identity.count === THROTTLE.loginIdentity.limit) {
      await audit(client, AuditEvent.LoginLockout, {
        actorId: user?.id ?? null,
        outcome: "DENIED",
        metadata: { email: input.email, windowSeconds: THROTTLE.loginIdentity.windowSeconds },
      });
    }
    // Deliberately identical for unknown account, bad password and disabled account.
    throw new HttpError(401, GENERIC_LOGIN_ERROR);
  }

  await reset(identityKey);
  if (passwordNeedsRehash(usable.passwordHash)) {
    await prisma.user.update({
      where: { id: usable.id },
      data: { passwordHash: await hashPassword(input.password) },
    });
  }
  // Session fixation: whatever session the browser arrived with dies here.
  if (presentedSessionToken) await revokeSessionByToken(presentedSessionToken, "REPLACED_BY_LOGIN");

  const session = await createSession(usable.id, client);
  await prisma.user.update({ where: { id: usable.id }, data: { lastLoginAt: new Date() } });
  await audit(client, AuditEvent.LoginSucceeded, { actorId: usable.id });
  const authUser = await loadAuthUser(usable.id);
  if (!authUser) throw new HttpError(401, GENERIC_LOGIN_ERROR);
  return { user: authUser, session };
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout(
  token: string | undefined,
  actor: { userId: string } | null,
  client: ClientInfo,
) {
  if (token) await revokeSessionByToken(token, "LOGOUT");
  if (actor) await audit(client, AuditEvent.Logout, { actorId: actor.userId });
}

// ---------------------------------------------------------------------------
// Password change (signed in)
// ---------------------------------------------------------------------------

/**
 * Requires the current password. On success every existing session for the
 * account — including this one — is revoked and a fresh session is issued, so
 * a stolen cookie does not survive a password change.
 */
export async function changePassword(
  input: { userId: string; currentPassword: string; newPassword: string },
  client: ClientInfo,
): Promise<AuthResult> {
  const key = limitKey("password-change:user", input.userId);
  requireAllowed(await peek(key, THROTTLE.passwordChangeUser));

  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user || !user.isActive) throw new HttpError(401, "Authentication is required.");

  if (!(await verifyPassword(user.passwordHash, input.currentPassword))) {
    await hit(key, THROTTLE.passwordChangeUser);
    await audit(client, AuditEvent.PasswordChangeFailed, {
      actorId: user.id,
      outcome: "FAILURE",
      metadata: { reason: "bad_current_password" },
    });
    throw new HttpError(403, "Your current password is incorrect.", {
      fields: { currentPassword: ["Your current password is incorrect."] },
    });
  }
  if (input.newPassword === input.currentPassword) {
    throw new HttpError(422, "Choose a password you have not used just now.", {
      fields: { newPassword: ["Choose a password you have not used just now."] },
    });
  }
  const violation = passwordPolicyViolation(input.newPassword, { email: user.email });
  if (violation) throw new HttpError(422, violation, { fields: { newPassword: [violation] } });

  const passwordHash = await hashPassword(input.newPassword);
  const session = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordChangedAt: new Date() },
    });
    const revoked = await revokeUserSessions(user.id, "PASSWORD_CHANGED", {}, tx);
    await auditIn(tx, client, AuditEvent.PasswordChanged, {
      actorId: user.id,
      targetType: "User",
      targetId: user.id,
      metadata: { sessionsRevoked: revoked },
    });
    return createSession(user.id, client, tx);
  });
  await reset(key);
  const authUser = await loadAuthUser(user.id);
  if (!authUser) throw new HttpError(401, "Authentication is required.");
  return { user: authUser, session };
}

// ---------------------------------------------------------------------------
// Password reset (signed out)
// ---------------------------------------------------------------------------

/**
 * Always resolves the same way whether or not the address is registered.
 * The token is 256-bit random, stored only as a SHA-256 hash, single-use and
 * short-lived. The link puts the token in the URL *fragment* so it never
 * reaches server logs or Referer headers.
 */
export async function requestPasswordReset(email: string, client: ClientInfo) {
  requireAllowed(await hit(limitKey("forgot:ip", client.ipAddress), THROTTLE.forgotIp));
  const perEmail = await hit(limitKey("forgot:email", email), THROTTLE.forgotEmail);
  if (!perEmail.allowed) return; // silent: do not reveal that this address is being throttled

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return;

  const token = randomToken();
  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000),
        ipAddress: client.ipAddress,
      },
    });
    await auditIn(tx, client, AuditEvent.PasswordResetRequested, {
      actorId: user.id,
      targetType: "User",
      targetId: user.id,
    });
  });
  await sendMail({
    to: user.email,
    subject: "Reset your Life Sutra password",
    text:
      `Use this link to choose a new password. It expires in ${PASSWORD_RESET_TTL_SECONDS / 60} minutes ` +
      `and can be used once.\n\n${getSiteUrl()}/auth/reset-password#token=${token}\n\n` +
      `If you did not ask for this, you can ignore this email.`,
  });
}

export async function completePasswordReset(
  input: { token: string; password: string },
  client: ClientInfo,
) {
  requireAllowed(await hit(limitKey("reset:ip", client.ipAddress), THROTTLE.resetIp));
  const invalid = () => new HttpError(400, "This reset link is invalid or has expired.");

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: tokenHash(input.token) },
    include: { user: { select: { id: true, email: true, isActive: true } } },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date() || !record.user.isActive) {
    await audit(client, AuditEvent.PasswordResetFailed, {
      actorId: record?.userId ?? null,
      outcome: "FAILURE",
      metadata: {
        reason: !record ? "unknown_token" : record.usedAt ? "used" : "expired_or_inactive",
      },
    });
    throw invalid();
  }
  const violation = passwordPolicyViolation(input.password, { email: record.user.email });
  if (violation) throw new HttpError(422, violation, { fields: { password: [violation] } });

  const passwordHash = await hashPassword(input.password);
  await prisma.$transaction(async (tx) => {
    // Single use, race-safe: only one concurrent request can flip usedAt.
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (claimed.count !== 1) throw invalid();
    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    });
    await tx.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    });
    const revoked = await revokeUserSessions(record.userId, "PASSWORD_RESET", {}, tx);
    await auditIn(tx, client, AuditEvent.PasswordResetCompleted, {
      actorId: record.userId,
      targetType: "User",
      targetId: record.userId,
      metadata: { sessionsRevoked: revoked },
    });
  });
}
