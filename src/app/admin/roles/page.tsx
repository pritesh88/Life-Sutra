import type { Metadata } from "next";
import { RolesPanel } from "@/components/admin/RolesPanel";
import { sectionPermissions } from "@/lib/admin/sections";
import { requirePageUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Roles & permissions" };

export default async function RolesPage() {
  await requirePageUser("/admin/roles", sectionPermissions("roles"));
  return <RolesPanel />;
}
