import { createPrismaClient } from "../src/lib/prisma-client";
import { syncRbac } from "../src/lib/auth/rbac/sync";

const prisma = createPrismaClient();

/**
 * Mirrors src/lib/auth/rbac/catalog.ts into the database. Safe to run any
 * number of times (and on every deploy).
 */
async function main() {
  const result = await syncRbac(prisma);
  console.log(
    result.changed
      ? `RBAC synced: +${result.rolesAdded} roles, +${result.permissionsAdded}/-${result.permissionsRemoved} permissions, +${result.grantsAdded}/-${result.grantsRemoved} grants.`
      : "RBAC already up to date.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
