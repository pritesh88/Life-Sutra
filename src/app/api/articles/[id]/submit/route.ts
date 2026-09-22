import { routeId } from "@/lib/api/query";
import { json, protectedRoute } from "@/lib/api/route";
import { getClientInfo } from "@/lib/http/client-info";
import { submitOwnArticle } from "@/lib/peer-review/service";

export const runtime = "nodejs";

export const POST = protectedRoute<{ id: string }>(
  { permission: "article:submit" },
  async ({ request, params, user }) =>
    json({
      article: await submitOwnArticle(user, routeId(params.id), getClientInfo(request.headers)),
    }),
);
