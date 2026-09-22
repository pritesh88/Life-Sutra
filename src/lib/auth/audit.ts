import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientInfo, type ClientInfo } from "@/lib/http/client-info";

export const AuditEvent = {
  Registered: "AUTH_REGISTERED",
  RegisterFailed: "AUTH_REGISTER_FAILED",
  LoginSucceeded: "AUTH_LOGIN",
  LoginFailed: "AUTH_LOGIN_FAILED",
  LoginLockout: "AUTH_LOGIN_LOCKOUT",
  Logout: "AUTH_LOGOUT",
  SessionRevoked: "AUTH_SESSION_REVOKED",
  SessionRotated: "AUTH_SESSION_ROTATED",
  PasswordChanged: "AUTH_PASSWORD_CHANGED",
  PasswordChangeFailed: "AUTH_PASSWORD_CHANGE_FAILED",
  PasswordResetRequested: "AUTH_PASSWORD_RESET_REQUESTED",
  PasswordResetCompleted: "AUTH_PASSWORD_RESET_COMPLETED",
  PasswordResetFailed: "AUTH_PASSWORD_RESET_FAILED",
  CsrfRejected: "SECURITY_CSRF_REJECTED",
  AuthorizationDenied: "AUTHORIZATION_DENIED",
  RoleAssigned: "ROLE_ASSIGNED",
  RoleRevoked: "ROLE_REVOKED",
  RbacSynced: "RBAC_SYNCED",
  AccountDeactivated: "ACCOUNT_DEACTIVATED",
  AccountActivated: "ACCOUNT_ACTIVATED",
  ArticleCreated: "ARTICLE_CREATED",
  ArticleSubmitted: "ARTICLE_SUBMITTED",
  ArticleDecision: "ARTICLE_DECISION",
  ArticlePublished: "ARTICLE_PUBLISHED",
  ReviewAssigned: "REVIEW_ASSIGNED",
  ReviewSubmitted: "REVIEW_SUBMITTED",
  IdentityViewed: "REVIEW_IDENTITY_VIEWED",
} as const;

export type AuditEventName = (typeof AuditEvent)[keyof typeof AuditEvent];
export type AuditDb = PrismaClient | Prisma.TransactionClient;
export type AuditMetadata = Record<string, string | number | boolean | null>;

export type AuditOptions = {
  actorId?: string | null;
  resource?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  outcome?: "SUCCESS" | "DENIED" | "FAILURE";
  metadata?: AuditMetadata;
};

const SENSITIVE_KEY = /pass(word)?|token|secret|hash|cookie|authorization/i;

/** Metadata is for context, never for credentials. Redact by key and bound the size. */
export function sanitizeMetadata(
  metadata: AuditMetadata | undefined,
): Prisma.InputJsonValue | undefined {
  if (!metadata) return undefined;
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEY.test(key)) clean[key] = "[redacted]";
    else clean[key] = typeof value === "string" ? value.slice(0, 500) : value;
  }
  return clean;
}

type Source = Request | ClientInfo | null;

function clientOf(source: Source): ClientInfo {
  if (!source) return { ipAddress: "system", userAgent: null };
  if (source instanceof Request) return getClientInfo(source.headers);
  return source;
}

function rowFor(
  source: Source,
  event: AuditEventName,
  options: AuditOptions,
): Prisma.AuditLogUncheckedCreateInput {
  const client = clientOf(source);
  const metadata = sanitizeMetadata(options.metadata);
  return {
    event,
    actorId: options.actorId ?? null,
    resource: options.resource ?? null,
    action: options.action ?? null,
    targetType: options.targetType ?? null,
    targetId: options.targetId ?? null,
    outcome: options.outcome ?? "SUCCESS",
    ipAddress: client.ipAddress,
    userAgent: client.userAgent,
    ...(metadata ? { metadata } : {}),
  };
}

/**
 * Best-effort audit write for events that must not break the request they
 * describe (failed logins, denials). Failures are logged loudly, not swallowed.
 */
export async function audit(source: Source, event: AuditEventName, options: AuditOptions = {}) {
  try {
    await prisma.auditLog.create({ data: rowFor(source, event, options) });
  } catch (error) {
    console.error(`[audit] failed to record ${event}`, error);
  }
}

/**
 * Transactional audit write for security-sensitive changes (roles, account
 * status, review assignment). Pass the transaction client: if the audit row
 * cannot be written, the change it describes is rolled back.
 */
export async function auditIn(
  db: AuditDb,
  source: Source,
  event: AuditEventName,
  options: AuditOptions = {},
) {
  await db.auditLog.create({ data: rowFor(source, event, options) });
}
