import type { PrismaClient } from "@prisma/client";
import {
  PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  splitPermission,
} from "@/lib/auth/rbac/catalog";

/**
 * Makes the Role / Permission / RolePermission tables exactly mirror the
 * catalog. Idempotent. Grants or permissions that are no longer in the catalog
 * are removed, so tightening a role in code really does tighten it in the
 * database. Any change is written to the audit log in the same transaction.
 *
 * Takes a PrismaClient (rather than importing the app singleton) so the seed
 * script, tests and the app can all use it.
 */
export async function syncRbac(prisma: PrismaClient) {
  return prisma.$transaction(async (tx) => {
    const summary = {
      permissionsAdded: 0,
      permissionsRemoved: 0,
      grantsAdded: 0,
      grantsRemoved: 0,
      rolesAdded: 0,
    };

    const permissionIds = new Map<string, string>();
    for (const key of PERMISSIONS) {
      const { resource, action } = splitPermission(key);
      const existing = await tx.permission.findUnique({
        where: { resource_action: { resource, action } },
      });
      const row = existing
        ? await tx.permission.update({
            where: { id: existing.id },
            data: { description: PERMISSION_DESCRIPTIONS[key] },
          })
        : await tx.permission.create({
            data: { resource, action, description: PERMISSION_DESCRIPTIONS[key] },
          });
      if (!existing) summary.permissionsAdded += 1;
      permissionIds.set(key, row.id);
    }

    const desiredIds = new Set(permissionIds.values());
    const stale = await tx.permission.findMany({ where: { id: { notIn: [...desiredIds] } } });
    if (stale.length > 0) {
      await tx.permission.deleteMany({ where: { id: { in: stale.map((p) => p.id) } } });
      summary.permissionsRemoved = stale.length;
    }

    for (const code of ROLES) {
      const before = await tx.role.findUnique({ where: { code } });
      const role = await tx.role.upsert({
        where: { code },
        update: { name: code.replaceAll("_", " "), description: ROLE_DESCRIPTIONS[code] },
        create: {
          code,
          name: code.replaceAll("_", " "),
          description: ROLE_DESCRIPTIONS[code],
        },
      });
      if (!before) summary.rolesAdded += 1;

      const wanted = new Set(ROLE_PERMISSIONS[code].map((key) => permissionIds.get(key)!));
      const current = await tx.rolePermission.findMany({ where: { roleId: role.id } });
      const currentIds = new Set(current.map((grant) => grant.permissionId));

      const revoke = [...currentIds].filter((id) => !wanted.has(id));
      if (revoke.length > 0) {
        await tx.rolePermission.deleteMany({
          where: { roleId: role.id, permissionId: { in: revoke } },
        });
        summary.grantsRemoved += revoke.length;
      }
      const grant = [...wanted].filter((id) => !currentIds.has(id));
      if (grant.length > 0) {
        await tx.rolePermission.createMany({
          data: grant.map((permissionId) => ({ roleId: role.id, permissionId })),
        });
        summary.grantsAdded += grant.length;
      }
    }

    const changed = Object.values(summary).some((count) => count > 0);
    if (changed) {
      await tx.auditLog.create({
        data: {
          event: "RBAC_SYNCED",
          resource: "role",
          action: "manage",
          targetType: "Rbac",
          ipAddress: "system",
          metadata: summary,
        },
      });
    }
    return { ...summary, changed };
  });
}
