import type { Metadata } from "next";
import { SubmissionsPanel } from "@/components/admin/SubmissionsPanel";
import { sectionPermissions } from "@/lib/admin/sections";
import { requirePageUser } from "@/lib/auth/guards";
import { firstParam, type SearchParams } from "@/lib/admin/search-params";

export const metadata: Metadata = { title: "Articles" };

export default async function ArticlesPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePageUser("/admin/articles", sectionPermissions("articles"));
  const params = await searchParams;
  return (
    <SubmissionsPanel
      scope="articles"
      permissions={user.permissions}
      initial={{ status: firstParam(params["status"]) }}
    />
  );
}
