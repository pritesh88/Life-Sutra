import type { Prisma } from "@prisma/client";
import { HttpError, forbidden, notFound } from "@/lib/api/errors";
import { AuditEvent, auditIn } from "@/lib/auth/audit";
import { ACTIVE_WINDOW_DAYS, RESEARCHER_ROLES } from "@/lib/admin/dashboard";
import { can, isSupersetOf } from "@/lib/auth/rbac/authorize";
import {
  ROLES,
  ROLE_PERMISSIONS,
  isRoleCode,
  permissionsForRoles,
  type RoleCode,
} from "@/lib/auth/rbac/catalog";
import { revokeUserSessions } from "@/lib/auth/session-store";
import type { AuthUser } from "@/lib/auth/types";
import { prisma } from "@/lib/db";
import type { ClientInfo } from "@/lib/http/client-info";

/**
 * Account and role administration. The rules that stop privilege escalation
 * live here, in one place, and are independent of which route calls them:
 *
 *  - You may not change your own roles or your own account status.
 *  - You may only grant/revoke a role whose permissions you hold in full
 *    (a role:manage holder who is not SUPER_ADMIN cannot mint a SUPER_ADMIN).
 *  - You may only act on an account whose current permissions you hold in
 *    full (you cannot demote or disable someone who outranks you).
 *  - The last active SUPER_ADMIN can never be demoted or deactivated.
 *  - Every change is audited in the same transaction, and revokes the
 *    target's sessions.
 */

const SUPER_ADMIN: RoleCode = "SUPER_ADMIN";

const userSummary = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  createdAt: true,
  lastLoginAt: true,
  roles: { select: { role: { select: { code: true } } } },
} satisfies Prisma.UserSelect;

function present(user: Prisma.UserGetPayload<{ select: typeof userSummary }>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    roles: user.roles.map(({ role }) => role.code).sort(),
  };
}

export type UserListOptions = {
  q?: string | undefined;
  cursor?: string | undefined;
  limit: number;
  role?: RoleCode | undefined;
  group?: "researchers" | undefined;
  status?: "active" | "inactive" | undefined;
  activity?: "active" | undefined;
};

const listedUser = {
  ...userSummary,
  _count: { select: { articles: { where: { status: { not: "DRAFT" } } } } },
  sessions: { orderBy: { lastSeenAt: "desc" }, take: 1, select: { lastSeenAt: true } },
} satisfies Prisma.UserSelect;

/**
 * `access` tells the UI which controls to offer for each row. It is computed by
 * the same rules the write endpoints enforce (superset of the target's
 * permissions, never yourself) — but it is only a hint: the endpoints re-check.
 */
export async function listUsers(actor: AuthUser, options: UserListOptions) {
  const and: Prisma.UserWhereInput[] = [];
  if (options.q)
    and.push({
      OR: [
        { email: { contains: options.q.toLowerCase() } },
        { name: { contains: options.q, mode: "insensitive" } },
      ],
    });
  if (options.role) and.push({ roles: { some: { role: { code: options.role } } } });
  if (options.group === "researchers")
    and.push({ roles: { some: { role: { code: { in: [...RESEARCHER_ROLES] } } } } });
  if (options.status) and.push({ isActive: options.status === "active" });
  if (options.activity === "active")
    and.push({
      sessions: {
        some: { lastSeenAt: { gte: new Date(Date.now() - ACTIVE_WINDOW_DAYS * 86_400_000) } },
      },
    });
  const where: Prisma.UserWhereInput = and.length > 0 ? { AND: and } : {};

  const rows = await prisma.user.findMany({
    where,
    orderBy: { id: "asc" },
    take: options.limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    select: listedUser,
  });
  const page = rows.slice(0, options.limit);
  const total = options.cursor ? null : await prisma.user.count({ where });

  return {
    users: page.map((row) => {
      const user = present(row);
      const outranks =
        actor.id !== row.id &&
        isSupersetOf(actor.permissions, [...permissionsForRoles(user.roles)]);
      return {
        ...user,
        submissions: row._count.articles,
        lastActiveAt: row.sessions[0]?.lastSeenAt ?? null,
        access: {
          status: outranks && can(actor, "user:manage"),
          roles: outranks && can(actor, "role:manage"),
        },
      };
    }),
    total,
    nextCursor: rows.length > options.limit ? (page[page.length - 1]?.id ?? null) : null,
  };
}

export async function listRoles(actor: AuthUser) {
  const roles = await prisma.role.findMany({
    orderBy: { code: "asc" },
    select: {
      code: true,
      name: true,
      description: true,
      permissions: { select: { permission: { select: { resource: true, action: true } } } },
      _count: { select: { users: true } },
    },
  });
  return {
    roles: roles.map((role) => ({
      code: role.code,
      name: role.name,
      description: role.description,
      userCount: role._count.users,
      permissions: role.permissions
        .map(({ permission }) => `${permission.resource}:${permission.action}`)
        .sort(),
    })),
    /** Roles this caller could grant or revoke (UI hint; assignRole/revokeRole enforce it). */
    assignable: can(actor, "role:manage")
      ? ROLES.filter((code) => isSupersetOf(actor.permissions, ROLE_PERMISSIONS[code]))
      : [],
  };
}

type Tx = Prisma.TransactionClient;

/** Serialises decisions that could remove the last SUPER_ADMIN. */
async function lockSuperAdminRole(tx: Tx) {
  await tx.$queryRaw`SELECT "id" FROM "Role" WHERE "code" = ${SUPER_ADMIN} FOR UPDATE`;
}

async function activeSuperAdminCount(tx: Tx) {
  return tx.user.count({
    where: { isActive: true, roles: { some: { role: { code: SUPER_ADMIN } } } },
  });
}

async function loadTarget(tx: Tx, targetId: string) {
  const target = await tx.user.findUnique({
    where: { id: targetId },
    select: { id: true, isActive: true, roles: { select: { role: { select: { code: true } } } } },
  });
  if (!target) throw notFound();
  return { ...target, roleCodes: target.roles.map(({ role }) => role.code) };
}

function assertMayActOn(actor: AuthUser, target: { roleCodes: string[] }) {
  const targetPermissions = [...permissionsForRoles(target.roleCodes)];
  if (!isSupersetOf(actor.permissions, targetPermissions)) throw forbidden();
}

function parseRole(code: string): RoleCode {
  if (!isRoleCode(code)) throw new HttpError(422, "Unknown role.");
  return code;
}

export async function assignRole(
  actor: AuthUser,
  targetId: string,
  roleInput: string,
  client: ClientInfo,
) {
  const role = parseRole(roleInput);
  if (actor.id === targetId) throw new HttpError(403, "You cannot change your own roles.");
  if (!isSupersetOf(actor.permissions, ROLE_PERMISSIONS[role])) throw forbidden();

  return prisma.$transaction(async (tx) => {
    if (role === SUPER_ADMIN) await lockSuperAdminRole(tx);
    const target = await loadTarget(tx, targetId);
    assertMayActOn(actor, target);
    if (target.roleCodes.includes(role))
      throw new HttpError(409, "The user already has that role.");

    const roleRow = await tx.role.findUniqueOrThrow({
      where: { code: role },
      select: { id: true },
    });
    await tx.userRole.create({
      data: { userId: target.id, roleId: roleRow.id, assignedBy: actor.id },
    });
    const revoked = await revokeUserSessions(target.id, "ROLE_CHANGED", {}, tx);
    await auditIn(tx, client, AuditEvent.RoleAssigned, {
      actorId: actor.id,
      resource: "role",
      action: "manage",
      targetType: "User",
      targetId: target.id,
      metadata: { role, previousRoles: target.roleCodes.join(","), sessionsRevoked: revoked },
    });
    return present(
      await tx.user.findUniqueOrThrow({ where: { id: target.id }, select: userSummary }),
    );
  });
}

export async function revokeRole(
  actor: AuthUser,
  targetId: string,
  roleInput: string,
  client: ClientInfo,
) {
  const role = parseRole(roleInput);
  if (actor.id === targetId) throw new HttpError(403, "You cannot change your own roles.");
  if (!isSupersetOf(actor.permissions, ROLE_PERMISSIONS[role])) throw forbidden();

  return prisma.$transaction(async (tx) => {
    if (role === SUPER_ADMIN) await lockSuperAdminRole(tx);
    const target = await loadTarget(tx, targetId);
    assertMayActOn(actor, target);
    if (!target.roleCodes.includes(role))
      throw new HttpError(409, "The user does not have that role.");
    if (role === SUPER_ADMIN && target.isActive && (await activeSuperAdminCount(tx)) <= 1)
      throw new HttpError(409, "The last active super administrator cannot be demoted.");

    await tx.userRole.deleteMany({ where: { userId: target.id, role: { code: role } } });
    const revoked = await revokeUserSessions(target.id, "ROLE_CHANGED", {}, tx);
    await auditIn(tx, client, AuditEvent.RoleRevoked, {
      actorId: actor.id,
      resource: "role",
      action: "manage",
      targetType: "User",
      targetId: target.id,
      metadata: { role, previousRoles: target.roleCodes.join(","), sessionsRevoked: revoked },
    });
    return present(
      await tx.user.findUniqueOrThrow({ where: { id: target.id }, select: userSummary }),
    );
  });
}

export async function setAccountActive(
  actor: AuthUser,
  targetId: string,
  isActive: boolean,
  client: ClientInfo,
) {
  if (actor.id === targetId) throw new HttpError(403, "You cannot change your own account status.");

  return prisma.$transaction(async (tx) => {
    await lockSuperAdminRole(tx);
    const target = await loadTarget(tx, targetId);
    assertMayActOn(actor, target);
    if (target.isActive === isActive)
      return present(
        await tx.user.findUniqueOrThrow({ where: { id: target.id }, select: userSummary }),
      );
    if (
      !isActive &&
      target.roleCodes.includes(SUPER_ADMIN) &&
      (await activeSuperAdminCount(tx)) <= 1
    )
      throw new HttpError(409, "The last active super administrator cannot be deactivated.");

    await tx.user.update({ where: { id: target.id }, data: { isActive } });
    const revoked = isActive
      ? 0
      : await revokeUserSessions(target.id, "ACCOUNT_DEACTIVATED", {}, tx);
    await auditIn(
      tx,
      client,
      isActive ? AuditEvent.AccountActivated : AuditEvent.AccountDeactivated,
      {
        actorId: actor.id,
        resource: "user",
        action: "manage",
        targetType: "User",
        targetId: target.id,
        metadata: { sessionsRevoked: revoked },
      },
    );
    return present(
      await tx.user.findUniqueOrThrow({ where: { id: target.id }, select: userSummary }),
    );
  });
}

/** Review events whose actor or metadata would tie a reviewer to a manuscript. */
const REVIEW_LINKING_EVENTS = {
  actor: ["REVIEW_SUBMITTED"],
  metadata: ["REVIEW_ASSIGNED"],
};

export type AuditListOptions = {
  cursor?: string | undefined;
  limit: number;
  event?: string | undefined;
  actorId?: string | undefined;
  outcome?: "SUCCESS" | "DENIED" | "FAILURE" | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
};

/**
 * Read-only. Actors are resolved to name/email for readability. Without
 * `review:view-identities` the entries that would link a reviewer to a
 * manuscript (who submitted a review; who was assigned) are redacted, and the
 * actor filter cannot be used to find a reviewer's submissions.
 */
export async function listAuditLogs(actor: AuthUser, options: AuditListOptions) {
  const identities = can(actor, "review:view-identities");
  const and: Prisma.AuditLogWhereInput[] = [];
  if (options.event) and.push({ event: options.event });
  if (options.actorId) and.push({ actorId: options.actorId });
  if (options.outcome) and.push({ outcome: options.outcome });
  if (options.from) and.push({ createdAt: { gte: options.from } });
  if (options.to) and.push({ createdAt: { lte: options.to } });
  // Without identity access the actor filter must not be usable to find a reviewer's submissions.
  if (!identities && options.actorId) and.push({ event: { notIn: REVIEW_LINKING_EVENTS.actor } });
  const where: Prisma.AuditLogWhereInput = and.length > 0 ? { AND: and } : {};

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: options.limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      event: true,
      resource: true,
      action: true,
      outcome: true,
      actorId: true,
      actor: { select: { id: true, name: true, email: true } },
      targetType: true,
      targetId: true,
      metadata: true,
      ipAddress: true,
      createdAt: true,
    },
  });
  const page = rows.slice(0, options.limit);
  const eventTypes = options.cursor
    ? undefined
    : (await prisma.auditLog.groupBy({ by: ["event"], orderBy: { event: "asc" } }))
        .map((row) => row.event)
        .filter((name) => identities || !REVIEW_LINKING_EVENTS.actor.includes(name));

  return {
    events: page.map((row) => {
      const hideActor = !identities && REVIEW_LINKING_EVENTS.actor.includes(row.event);
      const hideMetadata = !identities && REVIEW_LINKING_EVENTS.metadata.includes(row.event);
      return {
        id: row.id,
        event: row.event,
        resource: row.resource,
        action: row.action,
        outcome: row.outcome,
        actorId: hideActor ? null : row.actorId,
        actor: hideActor ? null : row.actor,
        targetType: row.targetType,
        targetId: row.targetId,
        metadata: hideMetadata ? null : row.metadata,
        ipAddress: row.ipAddress,
        createdAt: row.createdAt,
      };
    }),
    ...(eventTypes ? { eventTypes } : {}),
    nextCursor: rows.length > options.limit ? (page[page.length - 1]?.id ?? null) : null,
  };
}
