import type { Metadata } from "next";
import { ReviewsPanel } from "@/components/admin/ReviewsPanel";
import { sectionPermissions } from "@/lib/admin/sections";
import { requirePageUser } from "@/lib/auth/guards";
import { firstParam, type SearchParams } from "@/lib/admin/search-params";

export const metadata: Metadata = { title: "Peer review" };

export default async function ReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePageUser("/admin/reviews", sectionPermissions("reviews"));
  const params = await searchParams;
  return (
    <ReviewsPanel
      permissions={user.permissions}
      initial={{ status: firstParam(params["status"]) }}
    />
  );
}
