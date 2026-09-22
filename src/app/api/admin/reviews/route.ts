import { z } from "zod";
import { listAdminReviews } from "@/lib/admin/dashboard";
import { EDITORIAL_ACCESS } from "@/lib/admin/sections";
import { pageQuery, readQuery } from "@/lib/api/query";
import { json, protectedRoute } from "@/lib/api/route";

export const runtime = "nodejs";

const query = pageQuery.extend({
  status: z.enum(["PENDING", "SUBMITTED"]).optional(),
  q: z.string().trim().min(1).max(100).optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/** Review assignments across all reviewers. Reviewer identity needs review:view-identities. */
export const GET = protectedRoute({ permission: EDITORIAL_ACCESS }, async ({ request, user }) => {
  const { status, q, order, cursor, limit } = readQuery(request.url, query);
  return json(
    await listAdminReviews(user, {
      order,
      limit,
      ...(status ? { status } : {}),
      ...(q ? { q } : {}),
      ...(cursor ? { cursor } : {}),
    }),
  );
});
