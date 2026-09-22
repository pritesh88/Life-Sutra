import { json, protectedRoute } from "@/lib/api/route";
import { AuditEvent, audit } from "@/lib/auth/audit";
import { revokeUserSessions } from "@/lib/auth/session-store";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

/** "Sign out everywhere else": revokes all of the caller's sessions except this one. */
export const POST = protectedRoute({}, async ({ request, session, user }) => {
  const revoked = await revokeUserSessions(user.id, "USER_REVOKED_OTHERS", {
    exceptSessionId: session.session.id,
  });
  await audit(getClientInfo(request.headers), AuditEvent.SessionRevoked, {
    actorId: user.id,
    targetType: "User",
    targetId: user.id,
    metadata: { count: revoked },
  });
  return json({ ok: true, revoked });
});
