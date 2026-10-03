import Link from "next/link";
import { Home } from "lucide-react";
import { Wrap } from "@/components/foundation/Wrap";
import { FOUNDATION } from "@/data/foundation";
import { IMPRINT, IMPRINT_EMAIL } from "@/data/life-sutra";
import { FOUNDATION_ROUTES, IMPRINT_BASE, JOURNAL_BASE } from "@/lib/routes";

export const IMPRINT_NAV = [
  { label: "Overview", href: `${IMPRINT_BASE}#overview` },
  { label: "The Imprint", href: `${IMPRINT_BASE}#imprint` },
  { label: "Forthcoming", href: `${IMPRINT_BASE}#forthcoming` },
  { label: "Editorial", href: `${IMPRINT_BASE}#editorial` },
  { label: "Publication Details", href: `${IMPRINT_BASE}#details` },
];

export function ImprintHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-imprint-line bg-imprint-paper/95 backdrop-blur">
      <div className="border-b border-imprint-line bg-imprint-parchment text-[0.72rem]">
        <Wrap className="flex h-9 items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-imprint-muted hover:text-imprint-ink"
          >
            <Home className="size-3.5" aria-hidden="true" />
            <span className="font-semibold">Home</span>
            <span className="hidden sm:inline">· {FOUNDATION.name}</span>
          </Link>
          <span className="hidden text-imprint-muted sm:inline">
            A publication of {FOUNDATION.publishingBody}
          </span>
        </Wrap>
      </div>
      <Wrap className="flex flex-col gap-1 py-3 md:h-[4.5rem] md:flex-row md:items-center md:justify-between md:py-0">
        <Link
          href={IMPRINT_BASE}
          className="flex items-baseline gap-3"
          aria-label="Life Sutra — publication home"
        >
          <span className="font-imprint-display text-[1.9rem] leading-none whitespace-nowrap text-imprint-burgundy italic">
            Life Sutra
          </span>
          <span className="islf-kicker text-[0.58rem] text-imprint-muted">Journal</span>
        </Link>
        <nav aria-label="Life Sutra" className="-mx-2 overflow-x-auto">
          <ul className="flex items-center whitespace-nowrap">
            {IMPRINT_NAV.slice(1).map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block px-2 py-2 font-imprint-display text-[1.05rem] text-imprint-ink/80 transition-colors hover:text-imprint-burgundy sm:px-3"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Wrap>
    </header>
  );
}

export function ImprintFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-imprint-line bg-imprint-parchment text-imprint-ink">
      <Wrap className="flex flex-col items-center py-16 text-center">
        <span className="h-px w-10 bg-imprint-copper" aria-hidden="true" />
        <p className="mt-6 font-imprint-display text-[2.6rem] leading-none text-imprint-burgundy italic">
          Life Sutra
        </p>
        <p className="islf-kicker mt-4 text-[0.6rem] text-imprint-muted">
          {IMPRINT.category} · {IMPRINT.status}
        </p>
        <p className="mt-5 font-imprint-body text-[1.02rem] text-imprint-muted">
          Published by {FOUNDATION.publishingBody}
        </p>
        <p className="mt-2 text-sm">
          <a
            href={`mailto:${IMPRINT_EMAIL}`}
            className="underline decoration-imprint-copper underline-offset-4 hover:text-imprint-burgundy"
          >
            {IMPRINT_EMAIL}
          </a>
        </p>
        <nav aria-label="Life Sutra and publisher" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {IMPRINT_NAV.map((i) => (
              <li key={i.href}>
                <a href={i.href} className="hover:text-imprint-burgundy hover:underline">
                  {i.label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-imprint-muted">
            <li>
              <Link href="/" className="hover:text-imprint-burgundy hover:underline">
                {FOUNDATION.name}
              </Link>
            </li>
            <li>
              <Link
                href={FOUNDATION_ROUTES.publications}
                className="hover:text-imprint-burgundy hover:underline"
              >
                All publications
              </Link>
            </li>
            <li>
              <Link href={JOURNAL_BASE} className="hover:text-imprint-burgundy hover:underline">
                Life Sutra Synthesis — Research Journal
              </Link>
            </li>
            <li>
              <Link
                href={FOUNDATION_ROUTES.contact}
                className="hover:text-imprint-burgundy hover:underline"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </Wrap>
      <div className="border-t border-imprint-line">
        <Wrap className="py-5 text-center text-xs text-imprint-muted">
          © {year} {FOUNDATION.name}. Life Sutra is a publication of {FOUNDATION.publishingBody}.
        </Wrap>
      </div>
    </footer>
  );
}
