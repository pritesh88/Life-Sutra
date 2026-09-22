import { routeId } from "@/lib/api/query";
import { json, protectedRoute, readJson } from "@/lib/api/route";
import { getClientInfo } from "@/lib/http/client-info";
import { getOwnAssignment, submitReview } from "@/lib/peer-review/service";
import { submitReviewSchema } from "@/lib/peer-review/validation";

export const runtime = "nodejs";

export const GET = protectedRoute<{ assignmentId: string }>(
  { permission: "review:submit" },
  async ({ params, user }) =>
    json({ assignment: await getOwnAssignment(user, routeId(params.assignmentId)) }),
);

export const POST = protectedRoute<{ assignmentId: string }>(
  { permission: "review:submit" },
  async ({ request, params, user }) => {
    const input = await readJson(request, submitReviewSchema);
    return json(
      {
        assignment: await submitReview(
          user,
          routeId(params.assignmentId),
          input,
          getClientInfo(request.headers),
        ),
      },
      201,
    );
  },
);
