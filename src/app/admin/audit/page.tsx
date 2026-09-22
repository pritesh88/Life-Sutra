import type { Metadata } from "next";
import { AuditPanel } from "@/components/admin/AuditPanel";
import { sectionPermissions } from "@/lib/admin/sections";
import { requirePageUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage() {
  await requirePageUser("/admin/audit", sectionPermissions("audit"));
  return <AuditPanel />;
}
