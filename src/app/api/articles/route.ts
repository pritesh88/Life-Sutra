import { json, protectedRoute, readJson } from "@/lib/api/route";
import { getClientInfo } from "@/lib/http/client-info";
import { createArticle, listOwnArticles } from "@/lib/peer-review/service";
import { createArticleSchema } from "@/lib/peer-review/validation";

export const runtime = "nodejs";

/** The caller's own articles. There is no way to list anyone else's from here. */
export const GET = protectedRoute({ permission: "article:create" }, async ({ user }) =>
  json({ articles: await listOwnArticles(user) }),
);

export const POST = protectedRoute({ permission: "article:create" }, async ({ request, user }) => {
  const input = await readJson(request, createArticleSchema);
  return json({ article: await createArticle(user, input, getClientInfo(request.headers)) }, 201);
});
