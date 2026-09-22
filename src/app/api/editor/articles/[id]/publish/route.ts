import { routeId } from "@/lib/api/query";
import { json, protectedRoute } from "@/lib/api/route";
import { getClientInfo } from "@/lib/http/client-info";
import { publishArticle } from "@/lib/peer-review/service";

export const runtime = "nodejs";

export const POST = protectedRoute<{ id: string }>(
  { permission: "article:publish" },
  async ({ request, params, user }) =>
    json(await publishArticle(user, routeId(params.id), getClientInfo(request.headers))),
);
