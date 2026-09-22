import { Prisma } from "@prisma/client";
import { HttpError, notFound } from "@/lib/api/errors";
import { AuditEvent, audit, auditIn } from "@/lib/auth/audit";
import { can } from "@/lib/auth/rbac/authorize";
import { loadAuthUser } from "@/lib/auth/session-store";
import type { AuthUser } from "@/lib/auth/types";
import { prisma } from "@/lib/db";
import type { ClientInfo } from "@/lib/http/client-info";
import {
  authorArticleSelect,
  authorArticleSummary,
  authorArticleView,
  editorialArticleSelect,
  editorialArticleView,
  reviewerAssignmentSelect,
  reviewerAssignmentSummary,
  reviewerAssignmentView,
} from "@/lib/peer-review/views";

/**
 * Peer-review operations. Authorization is two layers:
 *   1. the route's permission (what kind of actor may call this), and
 *   2. resource rules enforced here (which rows this actor may touch):
 *      - authors touch only their own articles,
 *      - reviewers touch only assignments addressed to them,
 *      - editorial staff never act on an article they authored,
 *      - a reviewer can never be assigned to their own article.
 * A row the caller may not touch is reported as 404, not 403, so ids cannot be
 * probed (IDOR).
 */

// --- Author ---------------------------------------------------------------

export async function createArticle(
  user: AuthUser,
  input: { title: string; abstract: string; manuscriptFileName?: string | undefined },
  client: ClientInfo,
) {
  return prisma.$transaction(async (tx) => {
    const article = await tx.article.create({
      // authorId always comes from the session, never from the request.
      data: {
        authorId: user.id,
        title: input.title,
        abstract: input.abstract,
        manuscriptFileName: input.manuscriptFileName ?? null,
      },
      select: authorArticleSelect,
    });
    await auditIn(tx, client, AuditEvent.ArticleCreated, {
      actorId: user.id,
      targetType: "Article",
      targetId: article.id,
    });
    return authorArticleView(article);
  });
}

export async function listOwnArticles(user: AuthUser) {
  const rows = await prisma.article.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: "desc" },
    select: authorArticleSelect,
  });
  return rows.map(authorArticleSummary);
}

export async function getOwnArticle(user: AuthUser, id: string) {
  const row = await prisma.article.findFirst({
    where: { id, authorId: user.id },
    select: authorArticleSelect,
  });
  if (!row) throw notFound();
  return authorArticleView(row);
}

export async function updateOwnArticle(
  user: AuthUser,
  id: string,
  patch: {
    title?: string | undefined;
    abstract?: string | undefined;
    manuscriptFileName?: string | null | undefined;
  },
) {
  const data: Prisma.ArticleUpdateManyMutationInput = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.abstract !== undefined) data.abstract = patch.abstract;
  if (patch.manuscriptFileName !== undefined) data.manuscriptFileName = patch.manuscriptFileName;

  // Ownership and editability are part of the WHERE clause: one atomic statement.
  const { count } = await prisma.article.updateMany({
    where: { id, authorId: user.id, status: "DRAFT" },
    data,
  });
  if (count === 0) {
    const exists = await prisma.article.findFirst({
      where: { id, authorId: user.id },
      select: { id: true },
    });
    if (!exists) throw notFound();
    throw new HttpError(409, "Only drafts can be edited.");
  }
  return getOwnArticle(user, id);
}

export async function submitOwnArticle(user: AuthUser, id: string, client: ClientInfo) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.article.updateMany({
      where: { id, authorId: user.id, status: "DRAFT" },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });
    if (count === 0) {
      const exists = await tx.article.findFirst({
        where: { id, authorId: user.id },
        select: { id: true },
      });
      if (!exists) throw notFound();
      throw new HttpError(409, "This article has already been submitted.");
    }
    await auditIn(tx, client, AuditEvent.ArticleSubmitted, {
      actorId: user.id,
      targetType: "Article",
      targetId: id,
    });
  });
  return getOwnArticle(user, id);
}

// --- Reviewer -------------------------------------------------------------

export async function listOwnAssignments(user: AuthUser) {
  const rows = await prisma.reviewAssignment.findMany({
    where: { reviewerId: user.id },
    orderBy: { createdAt: "desc" },
    select: reviewerAssignmentSelect,
  });
  return rows.map(reviewerAssignmentSummary);
}

export async function getOwnAssignment(user: AuthUser, assignmentId: string) {
  const row = await prisma.reviewAssignment.findFirst({
    where: { id: assignmentId, reviewerId: user.id },
    select: reviewerAssignmentSelect,
  });
  if (!row) throw notFound();
  return reviewerAssignmentView(row);
}

export async function submitReview(
  user: AuthUser,
  assignmentId: string,
  input: {
    recommendation: "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT";
    commentsToAuthor: string;
    commentsToEditor?: string | undefined;
  },
  client: ClientInfo,
) {
  await prisma.$transaction(async (tx) => {
    // Own assignment only; the row is locked so a double-submit cannot slip through.
    const rows = await tx.$queryRaw<{ id: string; status: string; articleId: string }[]>`
      SELECT "id", "status"::text AS "status", "articleId" FROM "ReviewAssignment"
      WHERE "id" = ${assignmentId} AND "reviewerId" = ${user.id} FOR UPDATE`;
    const assignment = rows[0];
    if (!assignment) throw notFound();
    if (assignment.status !== "PENDING")
      throw new HttpError(409, "This review has already been submitted.");
    const article = await tx.article.findUniqueOrThrow({
      where: { id: assignment.articleId },
      select: { status: true },
    });
    if (article.status !== "UNDER_REVIEW")
      throw new HttpError(409, "This manuscript is no longer under review.");

    await tx.review.create({
      data: {
        assignmentId,
        recommendation: input.recommendation,
        commentsToAuthor: input.commentsToAuthor,
        commentsToEditor: input.commentsToEditor ?? null,
      },
    });
    await tx.reviewAssignment.update({
      where: { id: assignmentId },
      data: { status: "SUBMITTED" },
    });
    await auditIn(tx, client, AuditEvent.ReviewSubmitted, {
      actorId: user.id,
      resource: "review",
      action: "submit",
      targetType: "ReviewAssignment",
      targetId: assignmentId,
      metadata: { recommendation: input.recommendation },
    });
  });
  return getOwnAssignment(user, assignmentId);
}

// --- Editorial ------------------------------------------------------------

const identityAccess = (user: AuthUser) => can(user, "review:view-identities");
const internalCommentAccess = (user: AuthUser) => can(user, "article:review");

/** Never includes drafts, and never includes articles the caller authored. */
export async function listEditorialQueue(user: AuthUser) {
  const withIdentities = identityAccess(user);
  const rows = await prisma.article.findMany({
    where: { status: { not: "DRAFT" }, authorId: { not: user.id } },
    orderBy: { submittedAt: "asc" },
    select: editorialArticleSelect(withIdentities),
  });
  return rows.map((row) =>
    editorialArticleView(row, {
      seeInternalComments: internalCommentAccess(user),
      identities: withIdentities,
    }),
  );
}

export async function getEditorialArticle(user: AuthUser, id: string, client: ClientInfo) {
  const withIdentities = identityAccess(user);
  const row = await prisma.article.findFirst({
    where: { id, status: { not: "DRAFT" }, authorId: { not: user.id } },
    select: editorialArticleSelect(withIdentities),
  });
  if (!row) throw notFound();
  if (withIdentities) {
    await audit(client, AuditEvent.IdentityViewed, {
      actorId: user.id,
      targetType: "Article",
      targetId: id,
    });
  }
  return editorialArticleView(row, {
    seeInternalComments: internalCommentAccess(user),
    identities: withIdentities,
  });
}

export async function listEligibleReviewers(user: AuthUser) {
  const rows = await prisma.user.findMany({
    where: {
      isActive: true,
      id: { not: user.id },
      roles: {
        some: {
          role: {
            permissions: { some: { permission: { resource: "review", action: "submit" } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return rows;
}

export async function assignReviewer(
  actor: AuthUser,
  articleId: string,
  reviewerId: string,
  client: ClientInfo,
) {
  // Eligibility is decided from the database, not from anything the client says.
  const reviewer = await loadAuthUser(reviewerId);
  if (!reviewer || !can(reviewer, "review:submit"))
    throw new HttpError(422, "That user cannot be assigned as a reviewer.");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const article = await tx.article.findFirst({
          where: { id: articleId, status: { not: "DRAFT" }, authorId: { not: actor.id } },
          select: { id: true, authorId: true, status: true },
        });
        if (!article) throw notFound();
        if (article.authorId === reviewerId)
          throw new HttpError(422, "That user cannot be assigned as a reviewer.");
        if (article.status !== "SUBMITTED" && article.status !== "UNDER_REVIEW")
          throw new HttpError(
            409,
            "Reviewers can only be assigned while a manuscript is in review.",
          );

        const last = await tx.reviewAssignment.aggregate({
          where: { articleId },
          _max: { reviewerLabel: true },
        });
        const assignment = await tx.reviewAssignment.create({
          data: {
            articleId,
            reviewerId,
            assignedById: actor.id,
            reviewerLabel: (last._max.reviewerLabel ?? 0) + 1,
          },
          select: { id: true, reviewerLabel: true },
        });
        await tx.article.update({ where: { id: articleId }, data: { status: "UNDER_REVIEW" } });
        await auditIn(tx, client, AuditEvent.ReviewAssigned, {
          actorId: actor.id,
          resource: "review",
          action: "assign",
          targetType: "Article",
          targetId: articleId,
          metadata: { reviewerId, assignmentId: assignment.id },
        });
        return { assignmentId: assignment.id, label: `Reviewer ${assignment.reviewerLabel}` };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = String((error.meta as { target?: unknown } | undefined)?.target ?? "");
        if (target.includes("reviewerLabel")) continue; // lost a label race: retry
        throw new HttpError(409, "That reviewer is already assigned to this manuscript.");
      }
      throw error;
    }
  }
  throw new HttpError(409, "Could not assign the reviewer. Please try again.");
}

export async function recordDecision(
  actor: AuthUser,
  articleId: string,
  input: { decision: "ACCEPTED" | "REJECTED" | "REVISION_REQUESTED"; note: string },
  client: ClientInfo,
) {
  await prisma.$transaction(async (tx) => {
    const article = await tx.article.findFirst({
      where: { id: articleId, status: { not: "DRAFT" }, authorId: { not: actor.id } },
      select: { status: true, assignments: { select: { status: true } } },
    });
    if (!article) throw notFound();
    if (article.status !== "SUBMITTED" && article.status !== "UNDER_REVIEW")
      throw new HttpError(409, "A decision has already been recorded for this manuscript.");
    const completed = article.assignments.filter((a) => a.status === "SUBMITTED").length;
    if (input.decision !== "REJECTED" && completed === 0)
      throw new HttpError(409, "At least one submitted review is required before this decision.");

    await tx.article.update({
      where: { id: articleId },
      data: { status: input.decision, decidedAt: new Date(), decisionNote: input.note },
    });
    await auditIn(tx, client, AuditEvent.ArticleDecision, {
      actorId: actor.id,
      resource: "article",
      action: "review",
      targetType: "Article",
      targetId: articleId,
      metadata: { decision: input.decision },
    });
  });
  return { ok: true as const };
}

export async function publishArticle(actor: AuthUser, articleId: string, client: ClientInfo) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.article.updateMany({
      where: { id: articleId, status: "ACCEPTED", authorId: { not: actor.id } },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    if (count === 0) {
      const exists = await tx.article.findFirst({
        where: { id: articleId, status: { not: "DRAFT" }, authorId: { not: actor.id } },
        select: { id: true },
      });
      if (!exists) throw notFound();
      throw new HttpError(409, "Only accepted manuscripts can be published.");
    }
    await auditIn(tx, client, AuditEvent.ArticlePublished, {
      actorId: actor.id,
      resource: "article",
      action: "publish",
      targetType: "Article",
      targetId: articleId,
    });
  });
  return { ok: true as const };
}
