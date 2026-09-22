import type { Metadata } from "next";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { sectionPermissions } from "@/lib/admin/sections";
import { requirePageUser } from "@/lib/auth/guards";
import { firstParam, type SearchParams } from "@/lib/admin/search-params";

export const metadata: Metadata = { title: "Users & researchers" };

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePageUser("/admin/users", sectionPermissions("users"));
  const params = await searchParams;
  return (
    <UsersPanel
      initial={{
        group: firstParam(params["group"]),
        status: firstParam(params["status"]),
        activity: firstParam(params["activity"]),
        role: firstParam(params["role"]),
      }}
    />
  );
}
