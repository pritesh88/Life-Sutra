/**
 * The single source of truth for roles, permissions and the role → permission
 * mapping. `npm run db:seed` mirrors this catalog into the Role / Permission /
 * RolePermission tables; request-time authorization reads the database, and a
 * test asserts the two never drift.
 *
 * Application code must ask "does the user hold permission X?" — never "is the
 * user an admin?". Ownership rules (e.g. "own article only") live in
 * src/lib/auth/rbac/policies and are applied *in addition to* a permission.
 *
 * This file has no server-only imports so the UI can share the types.
 */

export const ROLES = [
  "SUPER_ADMIN",
  "JOURNAL_ADMIN",
  "EDITOR",
  "REVIEWER_MANAGER",
  "REVIEWER",
  "RESEARCH_ADMIN",
  "CONTENT_EDITOR",
  "SUPPORT_ADMIN",
  "RESEARCHER",
  "AUTHOR",
  "INSTITUTION_MEMBER",
  "READER",
] as const;
export type RoleCode = (typeof ROLES)[number];

export const PERMISSION_DESCRIPTIONS = {
  "profile:read": "Read own profile",
  "profile:update": "Update own profile",

  "article:create": "Create own article drafts",
  "article:edit": "Edit own article drafts",
  "article:submit": "Submit own article for review",
  "article:review": "Work the editorial queue and record decisions",
  "article:publish": "Publish accepted articles",

  "review:assign": "Assign reviewers to submissions",
  "review:submit": "Submit a review for an assigned manuscript",
  "review:view-identities": "See author and reviewer identities (breaks anonymity)",

  "user:read": "List and view user accounts",
  "user:manage": "Activate / deactivate user accounts",
  "role:manage": "Grant and revoke roles",

  "institution:manage": "Manage institution records",
  "opportunity:manage": "Manage research opportunities",
  "methodology:manage": "Manage methodology content",
  "dialogue:moderate": "Moderate IKS dialogue content",

  "audit:view": "View the audit log",
} as const;

export type Permission = keyof typeof PERMISSION_DESCRIPTIONS;
export const PERMISSIONS = Object.keys(PERMISSION_DESCRIPTIONS) as Permission[];

/** Kept as the wider template type so legacy `${string}:${string}` callers still compile. */
export type PermissionKey = Permission;

const own: Permission[] = ["profile:read", "profile:update"];
const authoring: Permission[] = ["article:create", "article:edit", "article:submit"];
const editorial: Permission[] = [
  "article:review",
  "article:publish",
  "review:assign",
  "review:view-identities",
];

export const ROLE_PERMISSIONS: Record<RoleCode, readonly Permission[]> = {
  SUPER_ADMIN: PERMISSIONS,
  JOURNAL_ADMIN: [...own, ...editorial, "user:read", "audit:view"],
  EDITOR: [...own, ...editorial],
  REVIEWER_MANAGER: [...own, "review:assign", "review:view-identities"],
  REVIEWER: [...own, "review:submit"],
  RESEARCH_ADMIN: [...own, "institution:manage", "opportunity:manage", "methodology:manage"],
  CONTENT_EDITOR: [...own, "opportunity:manage", "methodology:manage"],
  SUPPORT_ADMIN: [...own, "user:read", "user:manage", "dialogue:moderate"],
  RESEARCHER: [...own, ...authoring],
  AUTHOR: [...own, ...authoring],
  INSTITUTION_MEMBER: [...own],
  READER: [...own],
};

export const ROLE_DESCRIPTIONS: Record<RoleCode, string> = {
  SUPER_ADMIN: "Full platform administration",
  JOURNAL_ADMIN: "Journal administration and oversight",
  EDITOR: "Editorial decisions and reviewer assignment",
  REVIEWER_MANAGER: "Assigns and coordinates reviewers",
  REVIEWER: "Peer reviewer (double-anonymous)",
  RESEARCH_ADMIN: "Research programme administration",
  CONTENT_EDITOR: "Site content editing",
  SUPPORT_ADMIN: "User support and moderation",
  RESEARCHER: "Researcher profile holder",
  AUTHOR: "Manuscript author",
  INSTITUTION_MEMBER: "Member of a partner institution",
  READER: "Registered reader",
};

/**
 * Roles granted to a self-registered account. Elevated roles are only ever
 * assigned by an administrator (or the bootstrap CLI) — never by the client.
 */
export const DEFAULT_REGISTRATION_ROLES: readonly RoleCode[] = ["READER", "AUTHOR"];

export function isRoleCode(value: unknown): value is RoleCode {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && value in PERMISSION_DESCRIPTIONS;
}

export function splitPermission(permission: Permission): { resource: string; action: string } {
  const index = permission.indexOf(":");
  return { resource: permission.slice(0, index), action: permission.slice(index + 1) };
}

/** Permission set for a list of role codes, derived from the catalog. */
export function permissionsForRoles(roles: readonly string[]): Set<Permission> {
  const result = new Set<Permission>();
  for (const role of roles) {
    if (isRoleCode(role)) for (const permission of ROLE_PERMISSIONS[role]) result.add(permission);
  }
  return result;
}
