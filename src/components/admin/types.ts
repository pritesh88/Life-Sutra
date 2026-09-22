/** Shapes returned by the admin APIs (kept in step with src/lib/admin/*). */

export type ArticleStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REVISION_REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "PUBLISHED";

export type Recommendation = "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT";

export type Kpis = {
  generatedAt: string;
  kpis: Partial<
    Record<
      | "newSubmissions"
      | "underReview"
      | "reviewsPending"
      | "decisionsPending"
      | "publishedArticles"
      | "activeResearchers",
      Record<string, number>
    >
  >;
};

export type SubmissionRow = {
  id: string;
  code: string;
  title: string;
  status: ArticleStatus;
  submittedAt: string | null;
  decidedAt: string | null;
  publishedAt: string | null;
  author: { id: string; name: string } | null;
  reviews: { assigned: number; submitted: number };
};

export type ReviewRow = {
  assignmentId: string;
  label: string;
  reviewer: { id: string; name: string } | null;
  status: "PENDING" | "SUBMITTED";
  assignedAt: string;
  submittedAt: string | null;
  recommendation: Recommendation | null;
  article: { id: string; code: string; title: string; status: ArticleStatus };
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  roles: string[];
  submissions: number;
  access: { status: boolean; roles: boolean };
};

export type RoleRow = {
  code: string;
  name: string;
  description: string | null;
  userCount: number;
  permissions: string[];
};

export type AuditRow = {
  id: string;
  event: string;
  resource: string | null;
  action: string | null;
  outcome: "SUCCESS" | "DENIED" | "FAILURE";
  actorId: string | null;
  actor: { id: string; name: string; email: string } | null;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
};

export type EditorialArticle = {
  id: string;
  manuscriptCode: string;
  title: string;
  abstract: string;
  manuscriptFile: string | null;
  status: ArticleStatus;
  submittedAt: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  publishedAt: string | null;
  author: { id: string; name: string; email: string } | null;
  assignments: {
    assignmentId: string;
    reviewer: { id: string; name: string } | null;
    label: string;
    status: "PENDING" | "SUBMITTED";
    assignedAt: string;
    review: {
      recommendation: Recommendation;
      commentsToAuthor: string;
      commentsToEditor: string | null;
      submittedAt: string;
    } | null;
  }[];
};
