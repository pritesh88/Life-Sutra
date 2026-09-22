import { notFound, redirect } from "next/navigation";
import { canAny } from "@/lib/auth/rbac/authorize";
import { getCurrentSession } from "@/lib/auth/session";
import type { Permission } from "@/lib/auth/types";

/**
 * Server-component guard. Validates the session against the database on every
 * render (the middleware only checks that a cookie exists). Pass one permission
 * or a list (any-of). Without a session it redirects to sign-in; without the
 * permission it renders Next's not-found UI, so the page's existence is not
 * confirmed and none of its content is produced.
 *
 * Note: the root loading.tsx makes Next flush a streaming shell before a guard
 * runs, so these arrive as a meta-refresh / not-found fallback with HTTP 200
 * rather than a bare 307/404. Nothing sensitive is rendered either way, and the
 * data behind every page is served by APIs that return real 401/403 statuses.
 */
export async function requirePageUser(
  returnTo: string,
  permission?: Permission | readonly Permission[],
) {
  const session = await getCurrentSession();
  if (!session) redirect(`/auth/login?next=${encodeURIComponent(returnTo)}`);
  if (permission) {
    const anyOf = Array.isArray(permission) ? permission : [permission as Permission];
    if (!canAny(session.user, anyOf)) notFound();
  }
  return session.user;
}
