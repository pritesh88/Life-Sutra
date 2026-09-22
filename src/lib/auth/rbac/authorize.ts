import type { AuthUser, Permission } from "@/lib/auth/types";

/**
 * The authorization service. Every permission decision in the app goes through
 * these functions; nothing else may compare role names.
 *
 * `user.permissions` is computed server-side from the database on every request
 * (User → UserRole → Role → RolePermission → Permission). It is never read
 * from the client.
 */

type HasPermissions = Pick<AuthUser, "permissions">;

export function can(user: HasPermissions, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

export function canAny(user: HasPermissions, permissions: readonly Permission[]): boolean {
  return permissions.some((permission) => can(user, permission));
}

export function canAll(user: HasPermissions, permissions: readonly Permission[]): boolean {
  return permissions.every((permission) => can(user, permission));
}

/** True when `actor` holds every permission in `required` (used to stop privilege escalation). */
export function isSupersetOf(actor: readonly Permission[], required: readonly Permission[]) {
  const held = new Set(actor);
  return required.every((permission) => held.has(permission));
}
