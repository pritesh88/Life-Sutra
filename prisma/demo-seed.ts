import { PrismaClient, type ArticleStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/crypto";
import { ROLES, type RoleCode } from "../src/lib/auth/rbac/catalog";

/**
 * DEVELOPMENT ONLY. Creates one demo account per role (all with the same
 * well-known password) and a handful of manuscripts in different stages, so the
 * admin dashboard and every permission can be tried by hand.
 *
 *   npm run db:demo
 *
 * Safe to run repeatedly. Refuses to run when NODE_ENV=production or when the
 * database is not on this machine (override with --allow-remote at your peril).
 */

const PASSWORD = "Demo-Passw0rd-2026";
const DOMAIN = "demo.lifesutra.test";

const prisma = new PrismaClient();

const PEOPLE: { key: string; role: RoleCode; name: string }[] = [
  { key: "superadmin", role: "SUPER_ADMIN", name: "Dr. Mahesh Lohar" },
  { key: "journaladmin", role: "JOURNAL_ADMIN", name: "Jayant Mehta" },
  { key: "editor", role: "EDITOR", name: "Esha Kulkarni" },
  { key: "reviewermanager", role: "REVIEWER_MANAGER", name: "Manoj Iyer" },
  { key: "reviewer1", role: "REVIEWER", name: "Rohan Deshpande" },
  { key: "reviewer2", role: "REVIEWER", name: "Rekha Nair" },
  { key: "researchadmin", role: "RESEARCH_ADMIN", name: "Radhika Sen" },
  { key: "contenteditor", role: "CONTENT_EDITOR", name: "Chitra Bose" },
  { key: "supportadmin", role: "SUPPORT_ADMIN", name: "Sunil Verma" },
  { key: "researcher", role: "RESEARCHER", name: "Ritu Kapoor" },
  { key: "author", role: "AUTHOR", name: "Ananya Sharma" },
  { key: "institution", role: "INSTITUTION_MEMBER", name: "Ishaan Gupta" },
  { key: "reader", role: "READER", name: "Rahul Joshi" },
];

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);
const email = (key: string) => `${key}@${DOMAIN}`;

function assertSafe() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Refusing to seed demo data in production.");
  const url = new URL(process.env["DATABASE_URL"] ?? "postgresql://none");
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  if (!local && !process.argv.includes("--allow-remote"))
    throw new Error(`Refusing: DATABASE_URL points at ${url.hostname}, not this machine.`);
}

async function main() {
  assertSafe();
  const roles = new Map((await prisma.role.findMany()).map((role) => [role.code, role.id]));
  if (!ROLES.every((code) => roles.has(code)))
    throw new Error("Roles are missing — run `npm run db:seed` first.");

  const passwordHash = await hashPassword(PASSWORD);
  const ids = new Map<string, string>();
  for (const person of PEOPLE) {
    const user = await prisma.user.upsert({
      where: { email: email(person.key) },
      update: { passwordHash, isActive: true, name: person.name },
      create: { email: email(person.key), name: person.name, passwordHash },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roles.get(person.role)! } },
      update: {},
      create: { userId: user.id, roleId: roles.get(person.role)!, assignedBy: "demo-seed" },
    });
    ids.set(person.key, user.id);
  }
  const id = (key: string) => ids.get(key)!;

  type Review = {
    reviewer: "reviewer1" | "reviewer2";
    label: number;
    done: boolean;
    waitingDays: number;
  };
  const manuscripts: {
    title: string;
    author: string;
    status: ArticleStatus;
    submittedDaysAgo: number | null;
    file?: string;
    reviews?: Review[];
    published?: boolean;
  }[] = [
    {
      title: "Bhava as a Pre-cognitive Field",
      author: "author",
      status: "SUBMITTED",
      submittedDaysAgo: 2,
      file: "Sharma_Ananya_Bhava_final.docx",
    },
    {
      title: "Collective Emotional Field Model (QEFM)",
      author: "researcher",
      status: "SUBMITTED",
      submittedDaysAgo: 5,
    },
    {
      title: "Prana and Emotional Regulation",
      author: "author",
      status: "UNDER_REVIEW",
      submittedDaysAgo: 12,
      file: "Sharma_Ananya_Prana_v2.docx",
      reviews: [
        { reviewer: "reviewer1", label: 1, done: false, waitingDays: 9 },
        { reviewer: "reviewer2", label: 2, done: false, waitingDays: 9 },
      ],
    },
    {
      title: "Quantum Emotional Semiconductors",
      author: "researcher",
      status: "UNDER_REVIEW",
      submittedDaysAgo: 20,
      file: "Kapoor_Ritu_QuantumEmotion.pdf",
      reviews: [
        { reviewer: "reviewer1", label: 1, done: true, waitingDays: 15 },
        { reviewer: "reviewer2", label: 2, done: true, waitingDays: 15 },
      ],
    },
    {
      title: "From Vrittis to Emotional Fields",
      author: "author",
      status: "PUBLISHED",
      submittedDaysAgo: 45,
      published: true,
      reviews: [{ reviewer: "reviewer1", label: 1, done: true, waitingDays: 40 }],
    },
    { title: "An unfinished draft", author: "author", status: "DRAFT", submittedDaysAgo: null },
  ];

  let created = 0;
  for (const item of manuscripts) {
    if (await prisma.article.findFirst({ where: { title: item.title, authorId: id(item.author) } }))
      continue;
    const article = await prisma.article.create({
      data: {
        authorId: id(item.author),
        title: item.title,
        abstract:
          "This paper examines the classification of experiential claims within Indian Knowledge Systems, " +
          "proposing a framework that separates textual, phenomenological and empirical evidence.",
        manuscriptFileName: item.file ?? null,
        status: item.status,
        submittedAt: item.submittedDaysAgo === null ? null : daysAgo(item.submittedDaysAgo),
        ...(item.published
          ? { publishedAt: daysAgo(30), decidedAt: daysAgo(32), decisionNote: "Accepted." }
          : {}),
      },
    });
    for (const review of item.reviews ?? []) {
      const assignment = await prisma.reviewAssignment.create({
        data: {
          articleId: article.id,
          reviewerId: id(review.reviewer),
          assignedById: id("editor"),
          reviewerLabel: review.label,
          status: review.done ? "SUBMITTED" : "PENDING",
          createdAt: daysAgo(review.waitingDays),
        },
      });
      if (review.done)
        await prisma.review.create({
          data: {
            assignmentId: assignment.id,
            recommendation: "MINOR_REVISION",
            commentsToAuthor:
              "A promising framework. Please clarify how the central claim is classified.",
            commentsToEditor: "Sound work; minor revisions only.",
          },
        });
    }
    created += 1;
  }

  console.log(
    `\nDemo data ready (${created} new manuscripts). Password for every account: ${PASSWORD}\n`,
  );
  for (const person of PEOPLE)
    console.log(`  ${person.role.padEnd(19)} ${email(person.key).padEnd(34)} ${person.name}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
