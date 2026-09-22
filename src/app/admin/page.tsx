import { OverviewPanel } from "@/components/admin/OverviewPanel";
import { sectionPermissions } from "@/lib/admin/sections";
import { requirePageUser } from "@/lib/auth/guards";

export default async function AdminOverviewPage() {
  const user = await requirePageUser("/admin", sectionPermissions("overview"));
  return <OverviewPanel permissions={user.permissions} />;
}
