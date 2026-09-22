import { routeId } from "@/lib/api/query";
import { json, protectedRoute, readJson } from "@/lib/api/route";
import { getClientInfo } from "@/lib/http/client-info";
import { recordDecision } from "@/lib/peer-review/service";
import { decisionSchema } from "@/lib/peer-review/validation";

export const runtime = "nodejs";

export const POST = protectedRoute<{ id: string }>(
  { permission: "article:review" },
  async ({ request, params, user }) => {
    const input = await readJson(request, decisionSchema);
    return json(
      await recordDecision(user, routeId(params.id), input, getClientInfo(request.headers)),
    );
  },
);
