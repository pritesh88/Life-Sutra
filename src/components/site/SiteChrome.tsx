"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Renders the public site's header/footer everywhere except the admin
 * dashboard, which has its own shell. Everything else renders exactly as before.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
