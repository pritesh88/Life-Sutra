import type { ArticleStatus, Prisma, ReviewAssignmentStatus } from "@prisma/client";
import { forbidden } from "@/lib/api/errors";
import { KPI_ACCESS } from "@/lib/admin/sections";
import { canAny, can } from "@/lib/auth/rbac/authorize";
import type { RoleCode } from "@/lib/auth/rbac/catalog";
import type { AuthUser } from "@/lib/auth/types";
import { prisma } from "@/lib/db";
import { manuscriptCode } from "@/lib/peer-review/anonymity";

/**
 * Read models for the admin dashboard. Nothing here writes; every count and
 * list is computed from the same `where` builders, so a KPI card and the list
 * it links to can never disagree.
 *
 * Anonymity is preserved exactly as in the editorial API: author and reviewer
 * identities are selected, returned — and searchable — only for holders of
 * `review:view-identities`. (Searching by name would otherwise be an oracle.)
 */

const DAY = 24 * 60 * 60 * 1000;
export const RESEARCHER_ROLES: readonly RoleCode[] = ["RESEARCHER", "AUTHOR"];
export const ACTIVE_WINDOW_DAYS = 30;

// --- Shared filters ---------------------------------------------------------

/** Staff never see drafts, nor manuscripts they wrote themselves (conflict of interest). */
export const editorialScope = (actor: AuthUser): Prisma.ArticleWhereInput => ({
  status: { not: "DRAFT" },
  authorId: { not: actor.id },
});

export const QUEUES = {
  /** Submitted, no reviewer assigned yet. */
  "awaiting-assignment": { status: "SUBMITTED" },
  "in-review": { status: "UNDER_REVIEW" },
  /** Every assigned review is in and none is outstanding: the editor can decide. */
  "ready-for-decision": {
    status: "UNDER_REVIEW",
    assignments: { some: { status: "SUBMITTED" }, none: { status: "PENDING" } },
  },
} as const satisfies Record<string, Prisma.ArticleWhereInput>;
export type QueueName = keyof typeof QUEUES;

const SCOPE_STATUSES = {
  submissions: ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "REJECTED"],
  articles: ["ACCEPTED", "PUBLISHED"],
} as const satisfies Record<string, readonly ArticleStatus[]>;
export type SubmissionScope = keyof typeof SCOPE_STATUSES;

export const researcherWhere = (options: { activeSince?: Date } = {}): Prisma.UserWhereInput => ({
  isActive: true,
  roles: { some: { role: { code: { in: [...RESEARCHER_ROLES] } } } },
  ...(options.activeSince
    ? { sessions: { some: { lastSeenAt: { gte: options.activeSince } } } }
    : {}),
});

// --- KPIs -----------------------------------------------------------------

export async function getDashboardKpis(actor: AuthUser) {
  const now = Date.now();
  const since7 = new Date(now - 7 * DAY);
  const since30 = new Date(now - 30 * DAY);
  const scope = editorialScope(actor);
  const kpis: Record<string, Record<string, number>> = {};
  const jobs: Promise<void>[] = [];
  const set = (key: keyof typeof KPI_ACCESS, compute: () => Promise<Record<string, number>>) => {
    if (canAny(actor, KPI_ACCESS[key]))
      jobs.push(compute().then((value) => void (kpis[key] = value)));
  };

  set("newSubmissions", async () => ({
    value: await prisma.article.count({ where: { ...scope, ...QUEUES["awaiting-assignment"] } }),
    submittedLast7Days: await prisma.article.count({
      where: { ...scope, submittedAt: { gte: since7 } },
    }),
  }));
  set("underReview", async () => ({
    value: await prisma.article.count({ where: { ...scope, ...QUEUES["in-review"] } }),
  }));
  set("reviewsPending", async () => ({
    value: await prisma.reviewAssignment.count({
      where: { status: "PENDING", article: { ...scope, ...QUEUES["in-review"] } },
    }),
  }));
  set("decisionsPending", async () => ({
    value: await prisma.article.count({ where: { ...scope, ...QUEUES["ready-for-decision"] } }),
  }));
  set("publishedArticles", async () => ({
    value: await prisma.article.count({ where: { ...scope, status: "PUBLISHED" } }),
    publishedLast30Days: await prisma.article.count({
      where: { ...scope, status: "PUBLISHED", publishedAt: { gte: since30 } },
    }),
  }));
  set("activeResearchers", async () => ({
    value: await prisma.user.count({ where: researcherWhere({ activeSince: since30 }) }),
    totalResearchers: await prisma.user.count({ where: researcherWhere() }),
    windowDays: ACTIVE_WINDOW_DAYS,
  }));

  await Promise.all(jobs);
  return { generatedAt: new Date().toISOString(), kpis };
}

// --- Submissions / articles -------------------------------------------------

const identityAccess = (actor: AuthUser) => can(actor, "review:view-identities");

type Page = { limit: number; cursor?: string | undefined; order: "asc" | "desc" };

export async function listAdminSubmissions(
  actor: AuthUser,
  options: Page & {
    scope: SubmissionScope;
    status?: ArticleStatus | undefined;
    queue?: QueueName | undefined;
    q?: string | undefined;
  },
) {
  // `submissions` is the review pipeline; `articles` is accepted/published work.
  if (options.scope === "submissions" && !canAny(actor, ["article:review", "review:assign"]))
    throw forbidden();

  const identities = identityAccess(actor);
  const where: Prisma.ArticleWhereInput = {
    AND: [
      editorialScope(actor),
      { status: { in: [...SCOPE_STATUSES[options.scope]] } },
      ...(options.status ? [{ status: options.status }] : []),
      ...(options.queue ? [QUEUES[options.queue]] : []),
      ...(options.q
        ? [
            {
              OR: [
                { title: { contains: options.q, mode: "insensitive" as const } },
                ...(identities
                  ? [{ author: { name: { contains: options.q, mode: "insensitive" as const } } }]
                  : []),
              ],
            },
          ]
        : []),
    ],
  };

  const rows = await prisma.article.findMany({
    where,
    orderBy: [{ submittedAt: options.order }, { id: options.order }],
    take: options.limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      status: true,
      submittedAt: true,
      decidedAt: true,
      publishedAt: true,
      // Only the status of each assignment — never who holds it.
      assignments: { select: { status: true } },
      ...(identities ? { author: { select: { id: true, name: true } } } : {}),
    },
  });
  const page = rows.slice(0, options.limit);
  const total = options.cursor ? undefined : await prisma.article.count({ where });

  return {
    submissions: page.map((row) => ({
      id: row.id,
      code: manuscriptCode(row.id),
      title: row.title,
      status: row.status,
      submittedAt: row.submittedAt,
      decidedAt: row.decidedAt,
      publishedAt: row.publishedAt,
      author:
        identities && "author" in row && row.author
          ? { id: row.author.id, name: row.author.name }
          : null,
      reviews: {
        assigned: row.assignments.length,
        submitted: row.assignments.filter((a) => a.status === "SUBMITTED").length,
      },
    })),
    total: total ?? null,
    nextCursor: rows.length > options.limit ? (page[page.length - 1]?.id ?? null) : null,
  };
}

// --- Peer review (assignments across all reviewers) ------------------------

export async function listAdminReviews(
  actor: AuthUser,
  options: Page & { status?: ReviewAssignmentStatus | undefined; q?: string | undefined },
) {
  const identities = identityAccess(actor);
  const where: Prisma.ReviewAssignmentWhereInput = {
    article: editorialScope(actor),
    ...(options.status ? { status: options.status } : {}),
    ...(options.q
      ? {
          OR: [
            { article: { title: { contains: options.q, mode: "insensitive" as const } } },
            ...(identities
              ? [{ reviewer: { name: { contains: options.q, mode: "insensitive" as const } } }]
              : []),
          ],
        }
      : {}),
  };

  const rows = await prisma.reviewAssignment.findMany({
    where,
    orderBy: [{ createdAt: options.order }, { id: options.order }],
    take: options.limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      reviewerLabel: true,
      status: true,
      createdAt: true,
      article: { select: { id: true, title: true, status: true } },
      review: { select: { recommendation: true, submittedAt: true } },
      ...(identities ? { reviewer: { select: { id: true, name: true } } } : {}),
    },
  });
  const page = rows.slice(0, options.limit);
  const total = options.cursor ? undefined : await prisma.reviewAssignment.count({ where });

  return {
    reviews: page.map((row) => ({
      assignmentId: row.id,
      label: `Reviewer ${row.reviewerLabel}`,
      reviewer:
        identities && "reviewer" in row && row.reviewer
          ? { id: row.reviewer.id, name: row.reviewer.name }
          : null,
      status: row.status,
      assignedAt: row.createdAt,
      submittedAt: row.review?.submittedAt ?? null,
      recommendation: row.review?.recommendation ?? null,
      article: {
        id: row.article.id,
        code: manuscriptCode(row.article.id),
        title: row.article.title,
        status: row.article.status,
      },
    })),
    total: total ?? null,
    nextCursor: rows.length > options.limit ? (page[page.length - 1]?.id ?? null) : null,
  };
}
