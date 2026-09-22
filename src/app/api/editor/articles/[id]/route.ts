import { routeId } from "@/lib/api/query";
import { json, protectedRoute } from "@/lib/api/route";
import { getClientInfo } from "@/lib/http/client-info";
import { getEditorialArticle } from "@/lib/peer-review/service";

export const runtime = "nodejs";

export const GET = protectedRoute<{ id: string }>(
  { permission: ["article:review", "review:assign"] },
  async ({ request, params, user }) =>
    json({
      article: await getEditorialArticle(user, routeId(params.id), getClientInfo(request.headers)),
    }),
);
