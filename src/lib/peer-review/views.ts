import type { ArticleStatus, Prisma, ReviewRecommendation } from "@prisma/client";
import { anonymizedFileName, manuscriptCode } from "@/lib/peer-review/anonymity";

/**
 * Every peer-review API response is built here from an explicit `select`.
 *
 * The rule that makes double-anonymity structural rather than aspirational:
 *   - author queries never select reviewerId / reviewer relations;
 *   - reviewer queries never select authorId / author relations;
 *   - views copy named fields into a fresh object (no spreading of DB rows),
 *     so adding a column to the schema can never leak it by accident.
 */

/** Statuses at which the editor has released reviewer feedback to the author. */
export const RELEASED_STATUSES: readonly ArticleStatus[] = [
  "REVISION_REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "PUBLISHED",
];

// --- Author ---------------------------------------------------------------

export const authorArticleSelect = {
  id: true,
  title: true,
  abstract: true,
  manuscriptFileName: true,
  status: true,
  submittedAt: true,
  decidedAt: true,
  decisionNote: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  assignments: {
    where: { status: "SUBMITTED" },
    orderBy: { reviewerLabel: "asc" },
    // NOTE: no reviewerId, no reviewer relation, no assignment id.
    select: {
      reviewerLabel: true,
      review: { select: { recommendation: true, commentsToAuthor: true } },
    },
  },
} satisfies Prisma.ArticleSelect;

type AuthorRow = Prisma.ArticleGetPayload<{ select: typeof authorArticleSelect }>;

export function authorArticleView(row: AuthorRow) {
  const released = RELEASED_STATUSES.includes(row.status);
  return {
    id: row.id,
    title: row.title,
    abstract: row.abstract,
    manuscriptFileName: row.manuscriptFileName,
    status: row.status,
    submittedAt: row.submittedAt,
    decidedAt: row.decidedAt,
    decisionNote: released ? row.decisionNote : null,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    // Only after the editor's decision, only comments-to-author, only ordinals.
    reviews: released
      ? row.assignments.flatMap((assignment) =>
          assignment.review
            ? [
                {
                  reviewer: `Reviewer ${assignment.reviewerLabel}`,
                  recommendation: assignment.review.recommendation as ReviewRecommendation,
                  comments: assignment.review.commentsToAuthor,
                },
              ]
            : [],
        )
      : [],
  };
}

export function authorArticleSummary(row: AuthorRow) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    submittedAt: row.submittedAt,
    updatedAt: row.updatedAt,
  };
}

// --- Reviewer -------------------------------------------------------------

export const reviewerAssignmentSelect = {
  id: true,
  status: true,
  createdAt: true,
  // NOTE: no assignedById, no reviewerId, and only non-identity article columns.
  article: {
    select: { id: true, title: true, abstract: true, manuscriptFileName: true },
  },
  review: {
    select: {
      recommendation: true,
      commentsToAuthor: true,
      commentsToEditor: true,
      submittedAt: true,
    },
  },
} satisfies Prisma.ReviewAssignmentSelect;

type ReviewerRow = Prisma.ReviewAssignmentGetPayload<{ select: typeof reviewerAssignmentSelect }>;

export function reviewerAssignmentView(row: ReviewerRow) {
  return {
    assignmentId: row.id,
    manuscriptCode: manuscriptCode(row.article.id),
    status: row.status,
    assignedAt: row.createdAt,
    title: row.article.title,
    abstract: row.article.abstract,
    manuscriptFile: anonymizedFileName(row.article.id, row.article.manuscriptFileName),
    myReview: row.review
      ? {
          recommendation: row.review.recommendation,
          commentsToAuthor: row.review.commentsToAuthor,
          commentsToEditor: row.review.commentsToEditor,
          submittedAt: row.review.submittedAt,
        }
      : null,
  };
}

export function reviewerAssignmentSummary(row: ReviewerRow) {
  return {
    assignmentId: row.id,
    manuscriptCode: manuscriptCode(row.article.id),
    title: row.article.title,
    status: row.status,
    assignedAt: row.createdAt,
  };
}

// --- Editorial ------------------------------------------------------------

/** Identities are selected only when the caller holds review:view-identities. */
export function editorialArticleSelect(withIdentities: boolean) {
  return {
    id: true,
    title: true,
    abstract: true,
    manuscriptFileName: true,
    status: true,
    submittedAt: true,
    decidedAt: true,
    decisionNote: true,
    publishedAt: true,
    ...(withIdentities ? { author: { select: { id: true, name: true, email: true } } } : {}),
    assignments: {
      orderBy: { reviewerLabel: "asc" as const },
      select: {
        id: true,
        reviewerLabel: true,
        status: true,
        createdAt: true,
        ...(withIdentities ? { reviewer: { select: { id: true, name: true } } } : {}),
        review: {
          select: {
            recommendation: true,
            commentsToAuthor: true,
            commentsToEditor: true,
            submittedAt: true,
          },
        },
      },
    },
  } satisfies Prisma.ArticleSelect;
}

type EditorialRow = {
  id: string;
  title: string;
  abstract: string;
  manuscriptFileName: string | null;
  status: ArticleStatus;
  submittedAt: Date | null;
  decidedAt: Date | null;
  decisionNote: string | null;
  publishedAt: Date | null;
  author?: { id: string; name: string; email: string };
  assignments: {
    id: string;
    reviewerLabel: number;
    status: string;
    createdAt: Date;
    reviewer?: { id: string; name: string };
    review: {
      recommendation: ReviewRecommendation;
      commentsToAuthor: string;
      commentsToEditor: string | null;
      submittedAt: Date;
    } | null;
  }[];
};

export function editorialArticleView(
  row: EditorialRow,
  options: { seeInternalComments: boolean; identities: boolean },
) {
  return {
    id: row.id,
    manuscriptCode: manuscriptCode(row.id),
    title: row.title,
    abstract: row.abstract,
    manuscriptFile: options.identities
      ? row.manuscriptFileName
      : anonymizedFileName(row.id, row.manuscriptFileName),
    status: row.status,
    submittedAt: row.submittedAt,
    decidedAt: row.decidedAt,
    decisionNote: row.decisionNote,
    publishedAt: row.publishedAt,
    author:
      options.identities && row.author
        ? { id: row.author.id, name: row.author.name, email: row.author.email }
        : null,
    assignments: row.assignments.map((assignment) => ({
      assignmentId: assignment.id,
      reviewer:
        options.identities && assignment.reviewer
          ? { id: assignment.reviewer.id, name: assignment.reviewer.name }
          : null,
      label: `Reviewer ${assignment.reviewerLabel}`,
      status: assignment.status,
      assignedAt: assignment.createdAt,
      review: assignment.review
        ? {
            recommendation: assignment.review.recommendation,
            commentsToAuthor: assignment.review.commentsToAuthor,
            commentsToEditor: options.seeInternalComments
              ? assignment.review.commentsToEditor
              : null,
            submittedAt: assignment.review.submittedAt,
          }
        : null,
    })),
  };
}
