import type { Metadata } from "next";
import { SubmissionsPanel } from "@/components/admin/SubmissionsPanel";
import { sectionPermissions } from "@/lib/admin/sections";
import { requirePageUser } from "@/lib/auth/guards";
import { firstParam, type SearchParams } from "@/lib/admin/search-params";

export const metadata: Metadata = { title: "Submissions" };

export default async function SubmissionsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePageUser("/admin/submissions", sectionPermissions("submissions"));
  const params = await searchParams;
  return (
    <SubmissionsPanel
      scope="submissions"
      permissions={user.permissions}
      initial={{ status: firstParam(params["status"]), queue: firstParam(params["queue"]) }}
    />
  );
}
