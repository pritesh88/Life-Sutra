import Link from "next/link";
import { DesktopNav, HeaderActions } from "@/components/site/HeaderNav";
import { Wordmark } from "@/components/site/Wordmark";
import { Container } from "@/components/site/primitives";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur">
      <div className="border-b border-rule/60 bg-earth text-earth-foreground">
        <Container className="flex h-9 items-center justify-between text-[0.7rem] tracking-wide">
          <p className="flex items-center gap-3">
            <Link href="/" className="link-underline font-semibold">
              <span className="sm:hidden">← ISLF</span>
              <span className="hidden sm:inline">A publication of I Smart Life Foundation</span>
            </Link>
            <span className="hidden lg:inline">
              ISSN: To Be Issued · Peer-reviewed · Open abstracts
            </span>
          </p>
          <p className="flex items-center gap-4">
            <span className="hidden md:inline">
              First Issue — 11 October 2026 · On the 80th Birthday of Dr. Vijay Bhatkar
            </span>
            <Link href="/submit-research" className="link-underline font-semibold">
              Call for Papers open
            </Link>
          </p>
        </Container>
      </div>

      <div className="relative">
        <Container className="flex h-18 items-center justify-between gap-6 py-3">
          <Wordmark />
          <HeaderActions />
        </Container>
        <DesktopNav />
      </div>
    </header>
  );
}
