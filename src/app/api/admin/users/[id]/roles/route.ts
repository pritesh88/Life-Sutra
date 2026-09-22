import { z } from "zod";
import { routeId } from "@/lib/api/query";
import { json, protectedRoute, readJson } from "@/lib/api/route";
import { assignRole } from "@/lib/admin/users";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

const body = z.object({ role: z.string().min(1).max(64) });

export const POST = protectedRoute<{ id: string }>(
  { permission: "role:manage" },
  async ({ request, params, user }) => {
    const { role } = await readJson(request, body);
    const updated = await assignRole(
      user,
      routeId(params.id),
      role,
      getClientInfo(request.headers),
    );
    return json({ user: updated }, 201);
  },
);
