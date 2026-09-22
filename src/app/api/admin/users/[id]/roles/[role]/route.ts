import { routeId } from "@/lib/api/query";
import { json, protectedRoute } from "@/lib/api/route";
import { revokeRole } from "@/lib/admin/users";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

export const DELETE = protectedRoute<{ id: string; role: string }>(
  { permission: "role:manage" },
  async ({ request, params, user }) => {
    const updated = await revokeRole(
      user,
      routeId(params.id),
      params.role,
      getClientInfo(request.headers),
    );
    return json({ user: updated });
  },
);
