import { z } from "zod";
import { pageQuery, readQuery } from "@/lib/api/query";
import { json, protectedRoute } from "@/lib/api/route";
import { listAuditLogs } from "@/lib/admin/users";

export const runtime = "nodejs";

const query = pageQuery.extend({
  event: z.string().max(64).optional(),
  actorId: z.string().max(64).optional(),
  outcome: z.enum(["SUCCESS", "DENIED", "FAILURE"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

/**
 * Read-only. There is intentionally no POST/PUT/PATCH/DELETE here — and the
 * database itself rejects UPDATE/DELETE on the table.
 */
export const GET = protectedRoute({ permission: "audit:view" }, async ({ request, user }) => {
  const { limit, cursor, event, actorId, outcome, from, to } = readQuery(request.url, query);
  return json(
    await listAuditLogs(user, {
      limit,
      ...(cursor ? { cursor } : {}),
      ...(event ? { event } : {}),
      ...(actorId ? { actorId } : {}),
      ...(outcome ? { outcome } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
  );
});
