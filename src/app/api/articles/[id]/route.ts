import { routeId } from "@/lib/api/query";
import { json, protectedRoute, readJson } from "@/lib/api/route";
import { getOwnArticle, updateOwnArticle } from "@/lib/peer-review/service";
import { updateArticleSchema } from "@/lib/peer-review/validation";

export const runtime = "nodejs";

export const GET = protectedRoute<{ id: string }>(
  { permission: ["article:create", "article:edit", "article:submit"] },
  async ({ params, user }) => json({ article: await getOwnArticle(user, routeId(params.id)) }),
);

export const PATCH = protectedRoute<{ id: string }>(
  { permission: "article:edit" },
  async ({ request, params, user }) => {
    const patch = await readJson(request, updateArticleSchema);
    return json({ article: await updateOwnArticle(user, routeId(params.id), patch) });
  },
);
