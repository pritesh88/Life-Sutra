import { json, protectedRoute } from "@/lib/api/route";
import { listRoles } from "@/lib/admin/users";

export const runtime = "nodejs";

export const GET = protectedRoute({ permission: ["role:manage", "user:read"] }, async ({ user }) =>
  json(await listRoles(user)),
);
