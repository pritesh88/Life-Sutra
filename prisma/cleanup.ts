import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

/**
 * Housekeeping for tables that only grow: dead sessions, spent reset tokens
 * and expired rate-limit windows. Run daily (cron / scheduled job). The audit
 * log is never touched — it is append-only by database trigger.
 */
async function main() {
  const now = new Date();
  const sessions = await prisma.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date(now.getTime() - 7 * DAY) } },
        { revokedAt: { lt: new Date(now.getTime() - 30 * DAY) } },
        { lastSeenAt: { lt: new Date(now.getTime() - 37 * DAY) } },
      ],
    },
  });
  const tokens = await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date(now.getTime() - 7 * DAY) } },
        { usedAt: { lt: new Date(now.getTime() - 7 * DAY) } },
      ],
    },
  });
  const limits = await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } });
  console.log(
    `Removed ${sessions.count} sessions, ${tokens.count} reset tokens, ${limits.count} rate-limit rows.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
