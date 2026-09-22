import { json, protectedRoute } from "@/lib/api/route";
import { listEditorialQueue } from "@/lib/peer-review/service";

export const runtime = "nodejs";

/** Editorial queue. Author/reviewer identities appear only for review:view-identities holders. */
export const GET = protectedRoute(
  { permission: ["article:review", "review:assign"] },
  async ({ user }) => json({ articles: await listEditorialQueue(user) }),
);
