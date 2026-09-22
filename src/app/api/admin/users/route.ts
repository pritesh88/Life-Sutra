import { z } from "zod";
import { pageQuery, readQuery } from "@/lib/api/query";
import { json, protectedRoute } from "@/lib/api/route";
import { listUsers } from "@/lib/admin/users";
import { ROLES } from "@/lib/auth/rbac/catalog";

export const runtime = "nodejs";

const query = pageQuery.extend({
  q: z.string().trim().min(1).max(100).optional(),
  role: z.enum(ROLES).optional(),
  group: z.enum(["researchers"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  activity: z.enum(["active"]).optional(),
});

export const GET = protectedRoute({ permission: "user:read" }, async ({ request, user }) => {
  const { q, role, group, status, activity, cursor, limit } = readQuery(request.url, query);
  return json(
    await listUsers(user, {
      limit,
      ...(q ? { q } : {}),
      ...(role ? { role } : {}),
      ...(group ? { group } : {}),
      ...(status ? { status } : {}),
      ...(activity ? { activity } : {}),
      ...(cursor ? { cursor } : {}),
    }),
  );
});
