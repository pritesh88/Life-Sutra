import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_ENTRY } from "@/lib/admin/sections";
import { requirePageUser } from "@/lib/auth/guards";
import { JOURNAL_ICONS } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Administration" },
  robots: { index: false, follow: false },
  // The admin area serves the journal (submissions, peer review).
  icons: JOURNAL_ICONS,
};

/**
 * Entry check only: it decides whether you may see the admin area at all and
 * builds the navigation. A layout does not re-run when you navigate between
 * its pages, so EVERY page below also authorizes itself for its own section.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requirePageUser("/admin", ADMIN_ENTRY);
  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
      }}
    >
      {children}
    </AdminShell>
  );
}
