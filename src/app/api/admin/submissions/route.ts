import { ArticleStatus } from "@prisma/client";
import { z } from "zod";
import { QUEUES, listAdminSubmissions, type QueueName } from "@/lib/admin/dashboard";
import { ARTICLE_ACCESS } from "@/lib/admin/sections";
import { pageQuery, readQuery } from "@/lib/api/query";
import { json, protectedRoute } from "@/lib/api/route";

export const runtime = "nodejs";

const query = pageQuery.extend({
  scope: z.enum(["submissions", "articles"]).default("submissions"),
  status: z.nativeEnum(ArticleStatus).optional(),
  queue: z.enum(Object.keys(QUEUES) as [QueueName, ...QueueName[]]).optional(),
  q: z.string().trim().min(1).max(100).optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/** Lightweight, paginated summaries. Full detail stays on /api/editor/articles/:id. */
export const GET = protectedRoute({ permission: ARTICLE_ACCESS }, async ({ request, user }) => {
  const { scope, status, queue, q, order, cursor, limit } = readQuery(request.url, query);
  return json(
    await listAdminSubmissions(user, {
      scope,
      order,
      limit,
      ...(status ? { status } : {}),
      ...(queue ? { queue } : {}),
      ...(q ? { q } : {}),
      ...(cursor ? { cursor } : {}),
    }),
  );
});
