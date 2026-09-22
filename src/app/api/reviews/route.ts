import { json, protectedRoute } from "@/lib/api/route";
import { listOwnAssignments } from "@/lib/peer-review/service";

export const runtime = "nodejs";

/** The caller's own review assignments, anonymised (no author information). */
export const GET = protectedRoute({ permission: "review:submit" }, async ({ user }) =>
  json({ assignments: await listOwnAssignments(user) }),
);
