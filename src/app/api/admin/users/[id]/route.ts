import { z } from "zod";
import { routeId } from "@/lib/api/query";
import { json, protectedRoute, readJson } from "@/lib/api/route";
import { setAccountActive } from "@/lib/admin/users";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

const body = z.object({ isActive: z.boolean() });

/** Activate / deactivate an account. Deactivation revokes every session. */
export const PATCH = protectedRoute<{ id: string }>(
  { permission: "user:manage" },
  async ({ request, params, user }) => {
    const { isActive } = await readJson(request, body);
    const updated = await setAccountActive(
      user,
      routeId(params.id),
      isActive,
      getClientInfo(request.headers),
    );
    return json({ user: updated });
  },
);
