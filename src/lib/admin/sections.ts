import { canAny } from "@/lib/auth/rbac/authorize";
import type { Permission } from "@/lib/auth/rbac/catalog";

/**
 * The admin dashboard's sections and the permissions that unlock them. This is
 * the only place that maps "section" → "permission"; the page guards, the API
 * routes and the navigation all read from here. It is pure data (no server
 * imports) so the UI can use it for navigation — but the navigation is UX only:
 * every page and API call re-checks on the server.
 */

/** Editorial staff: anyone who works the submission queue or assigns reviewers. */
export const EDITORIAL_ACCESS: readonly Permission[] = ["article:review", "review:assign"];
/** Anyone who may see accepted / published articles. */
export const ARTICLE_ACCESS: readonly Permission[] = [...EDITORIAL_ACCESS, "article:publish"];

export type AdminSectionKey =
  "overview" | "users" | "roles" | "submissions" | "reviews" | "articles" | "audit";

export type AdminSection = {
  key: AdminSectionKey;
  href: string;
  label: string;
  permissions: readonly Permission[];
};

const sections: Record<Exclude<AdminSectionKey, "overview">, AdminSection> = {
  users: {
    key: "users",
    href: "/admin/users",
    label: "Users & Researchers",
    permissions: ["user:read"],
  },
  roles: {
    key: "roles",
    href: "/admin/roles",
    label: "Roles & Permissions",
    permissions: ["role:manage", "user:read"],
  },
  submissions: {
    key: "submissions",
    href: "/admin/submissions",
    label: "Submissions",
    permissions: EDITORIAL_ACCESS,
  },
  reviews: {
    key: "reviews",
    href: "/admin/reviews",
    label: "Peer Review",
    permissions: EDITORIAL_ACCESS,
  },
  articles: {
    key: "articles",
    href: "/admin/articles",
    label: "Articles",
    permissions: ARTICLE_ACCESS,
  },
  audit: {
    key: "audit",
    href: "/admin/audit",
    label: "Audit Logs",
    permissions: ["audit:view"],
  },
};

/** Any permission that unlocks at least one section grants entry to /admin. */
export const ADMIN_ENTRY: readonly Permission[] = [
  ...new Set(Object.values(sections).flatMap((section) => section.permissions)),
];

export const ADMIN_SECTIONS: readonly AdminSection[] = [
  { key: "overview", href: "/admin", label: "Overview", permissions: ADMIN_ENTRY },
  sections.submissions,
  sections.reviews,
  sections.articles,
  sections.users,
  sections.roles,
  sections.audit,
];

export function sectionPermissions(key: AdminSectionKey): readonly Permission[] {
  return ADMIN_SECTIONS.find((section) => section.key === key)!.permissions;
}

export function visibleSections(user: { permissions: readonly string[] }) {
  return ADMIN_SECTIONS.filter((section) =>
    canAny({ permissions: user.permissions as Permission[] }, section.permissions),
  );
}

/** Who may see which headline number. A KPI the caller cannot see is omitted, never zero. */
export const KPI_ACCESS = {
  newSubmissions: EDITORIAL_ACCESS,
  underReview: EDITORIAL_ACCESS,
  reviewsPending: EDITORIAL_ACCESS,
  decisionsPending: EDITORIAL_ACCESS,
  publishedArticles: ARTICLE_ACCESS,
  activeResearchers: ["user:read"],
} as const satisfies Record<string, readonly Permission[]>;
