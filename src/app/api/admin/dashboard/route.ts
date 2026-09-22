import { json, protectedRoute } from "@/lib/api/route";
import { getDashboardKpis } from "@/lib/admin/dashboard";
import { ADMIN_ENTRY } from "@/lib/admin/sections";

export const runtime = "nodejs";

/**
 * Headline numbers. Any admin permission may call this; each KPI is included
 * only if the caller holds the permission that unlocks it (see KPI_ACCESS), so
 * an omitted KPI means "not yours to see", never "zero".
 */
export const GET = protectedRoute({ permission: ADMIN_ENTRY }, async ({ user }) =>
  json(await getDashboardKpis(user)),
);
