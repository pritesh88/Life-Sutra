import { PrismaClient } from "@prisma/client";
import { isRoleCode } from "../src/lib/auth/rbac/catalog";

const prisma = new PrismaClient();
const [email, roleCode] = process.argv.slice(2);

/**
 * Break-glass / bootstrap: grant a role to a registered account from a shell
 * with database access. This is how the very first SUPER_ADMIN is created —
 * there is deliberately no HTTP path that can do it. The change is audited
 * (actor = system, target = the user) and the user's sessions are revoked so
 * the new role applies to a fresh login.
 */
async function main() {
  if (!email || !roleCode || !isRoleCode(roleCode)) {
    throw new Error("Usage: npm run db:assign-role -- person@example.com SUPER_ADMIN");
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { email: email.toLowerCase() } });
  const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode } });

  await prisma.$transaction(async (tx) => {
    const existing = await tx.userRole.findUnique({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
    });
    if (existing) {
      console.log(`${user.email} already has ${role.code}.`);
      return;
    }
    await tx.userRole.create({
      data: { userId: user.id, roleId: role.id, assignedBy: "bootstrap-cli" },
    });
    const { count } = await tx.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: "ROLE_CHANGED" },
    });
    await tx.auditLog.create({
      data: {
        event: "ROLE_ASSIGNED",
        resource: "role",
        action: "manage",
        targetType: "User",
        targetId: user.id,
        ipAddress: "cli",
        metadata: { role: role.code, via: "bootstrap-cli", sessionsRevoked: count },
      },
    });
    console.log(`Assigned ${role.code} to ${user.email}.`);
  });
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
