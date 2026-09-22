import type { Permission } from "@/lib/auth/rbac/catalog";

export type { Permission } from "@/lib/auth/rbac/catalog";
/** Alias kept so existing imports keep compiling. */
export type PermissionKey = Permission;

/** What the server knows about the caller. Sent to the browser for UX only. */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: Permission[];
};
