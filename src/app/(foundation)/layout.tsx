import type { ReactNode } from "react";
import { FoundationFooter } from "@/components/foundation/FoundationFooter";
import { FoundationHeader } from "@/components/foundation/FoundationHeader";
import { cormorant, newsreader, publicSans } from "@/lib/fonts";

/** I Smart Life Foundation — the publisher's own chrome and theme. */
export default function FoundationLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`theme-islf flex min-h-screen flex-col ${newsreader.variable} ${publicSans.variable} ${cormorant.variable}`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-islf-paper focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <FoundationHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <FoundationFooter />
    </div>
  );
}
