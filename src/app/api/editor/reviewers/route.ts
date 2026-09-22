import { json, protectedRoute } from "@/lib/api/route";
import { listEligibleReviewers } from "@/lib/peer-review/service";

export const runtime = "nodejs";

export const GET = protectedRoute({ permission: "review:assign" }, async ({ user }) =>
  json({ reviewers: await listEligibleReviewers(user) }),
);
