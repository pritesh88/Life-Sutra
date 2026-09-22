import { routeId } from "@/lib/api/query";
import { json, protectedRoute, readJson } from "@/lib/api/route";
import { getClientInfo } from "@/lib/http/client-info";
import { assignReviewer } from "@/lib/peer-review/service";
import { assignReviewerSchema } from "@/lib/peer-review/validation";

export const runtime = "nodejs";

export const POST = protectedRoute<{ id: string }>(
  { permission: "review:assign" },
  async ({ request, params, user }) => {
    const { reviewerId } = await readJson(request, assignReviewerSchema);
    const result = await assignReviewer(
      user,
      routeId(params.id),
      reviewerId,
      getClientInfo(request.headers),
    );
    return json({ assignment: result }, 201);
  },
);
