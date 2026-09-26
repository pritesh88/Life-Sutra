import type { ReactNode } from "react";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteFooter } from "@/components/site/Footer";
import { SiteHeader } from "@/components/site/Navbar";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteChrome>
        <SiteHeader />
      </SiteChrome>
      <main className="flex-1">{children}</main>
      <SiteChrome>
        <SiteFooter />
      </SiteChrome>
    </div>
  );
}
