"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Wrap } from "./Wrap";
import { type Book, publishedBooks, upcomingBooks } from "@/data/books";
import { FOUNDATION, publications } from "@/data/foundation";
import { FOUNDATION_ROUTES } from "@/lib/routes";
import { ASSETS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { PublicationMark } from "./PublicationMark";

const NAV = [
  { label: "Home", to: FOUNDATION_ROUTES.home },
  { label: "About the Foundation", to: FOUNDATION_ROUTES.about },
  { label: "Vision & Mission", to: FOUNDATION_ROUTES.visionMission },
  { label: "Our Approach", to: FOUNDATION_ROUTES.approach },
] as const;

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
}

export function FoundationLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 rounded-sm"
      aria-label={`${FOUNDATION.name} — home`}
    >
      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-sm border border-islf-stone bg-white">
        <Image
          src={ASSETS.ismartlifelogo}
          alt=""
          width={255}
          height={263}
          className="h-11 w-auto"
          priority
        />
      </span>
      <span className={cn("leading-tight", compact && "hidden sm:block")}>
        <span className="block font-islf-serif text-[1.15rem] tracking-tight whitespace-nowrap text-islf-ink">
          I Smart Life Foundation
        </span>
        <span className="islf-kicker block text-[0.6rem] whitespace-nowrap text-islf-muted">
          Publishing body · India
        </span>
      </span>
    </Link>
  );
}

/* ---------- Menu entries ---------- */

type MenuItem = { key: string; href: string; title: string; meta: string; mark: ReactNode };

const PUBLICATION_ITEMS: MenuItem[] = publications.map((p) => ({
  key: p.slug,
  href: p.href,
  title: p.title,
  meta: `${p.designation} · ${p.status}`,
  mark: <PublicationMark slug={p.slug} />,
}));

function BookThumb({ book }: { book: Book }) {
  return book.cover ? (
    <Image
      src={book.cover.src}
      alt=""
      width={book.cover.width}
      height={book.cover.height}
      className="h-12 w-8 shrink-0 object-cover shadow-sm"
    />
  ) : (
    <span
      className="islf-aurora grid h-12 w-8 shrink-0 place-items-center text-islf-glow"
      aria-hidden="true"
    >
      <span className="size-1.5 rounded-full bg-current" />
    </span>
  );
}

const BOOK_ITEMS: MenuItem[] = [
  ...publishedBooks.map((book) => ({ book, upcoming: false })),
  ...upcomingBooks.map((book) => ({ book, upcoming: true })),
].map(({ book, upcoming }) => ({
  key: book.slug,
  href: `${FOUNDATION_ROUTES.books}#${book.slug}`,
  title: book.title,
  meta: [upcoming ? "Upcoming" : "Published", book.subtitle].filter(Boolean).join(" · "),
  mark: <BookThumb book={book} />,
}));

function MenuEntry({ item }: { item: MenuItem }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-4 p-3 transition-colors hover:bg-islf-ivory"
    >
      {item.mark}
      <span className="min-w-0">
        <span className="block font-islf-serif text-lg leading-tight text-islf-ink">
          {item.title}
        </span>
        <span className="mt-0.5 line-clamp-1 text-xs text-islf-muted">{item.meta}</span>
      </span>
    </Link>
  );
}

type GroupProps = { label: string; items: MenuItem[]; allHref: string; allLabel: string };

/** Desktop dropdown: Publications and Books. */
function DropdownMenu({
  pathname,
  heading,
  label,
  items,
  allHref,
  allLabel,
}: GroupProps & { pathname: string; heading: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const panelId = useId();
  const active = isActive(pathname, allHref);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 py-2 text-[0.88rem] text-islf-ink/75 transition-colors hover:text-islf-ink",
          (active || open) && "text-islf-ink",
        )}
      >
        {label}
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute top-full left-1/2 z-50 mt-3 max-h-[calc(100dvh-7rem)] w-[25rem] -translate-x-1/2 overflow-y-auto border border-islf-stone bg-islf-paper p-2 whitespace-normal shadow-[0_24px_60px_-28px_rgb(38_68_58/0.45)]"
        >
          <p className="islf-kicker px-3 pt-2 pb-3 text-[0.62rem] text-islf-muted">{heading}</p>
          <ul>
            {items.map((item) => (
              <li key={item.key}>
                <MenuEntry item={item} />
              </li>
            ))}
          </ul>
          <Link
            href={allHref}
            className="mt-1 flex items-center justify-between border-t border-islf-stone px-3 pt-3 pb-2 text-sm font-semibold text-islf-indigo hover:text-islf-ink"
          >
            {allLabel} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </li>
  );
}

/** Collapsible group in the mobile menu. */
function MobileGroup({ label, items, allHref, allLabel }: GroupProps) {
  // Open by default so the lists show as soon as the menu opens; tap to collapse.
  const [open, setOpen] = useState(true);
  const panelId = useId();
  return (
    <div className="border-t border-islf-stone">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-1 py-3 font-islf-serif text-lg text-islf-ink"
      >
        {label}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div id={panelId} className="pb-3">
          {items.map((item) => (
            <MenuEntry key={item.key} item={item} />
          ))}
          <Link
            href={allHref}
            className="flex items-center gap-2 px-3 pt-2 text-sm font-semibold text-islf-indigo"
          >
            {allLabel} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

const PUBLICATIONS_GROUP: GroupProps = {
  label: "Publications",
  items: PUBLICATION_ITEMS,
  allHref: FOUNDATION_ROUTES.publications,
  allLabel: "All publications",
};

const BOOKS_GROUP: GroupProps = {
  label: "Books",
  items: BOOK_ITEMS,
  allHref: FOUNDATION_ROUTES.books,
  allLabel: "All books",
};

export function FoundationHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-islf-stone bg-islf-ivory/94 backdrop-blur">
      <Wrap className="flex h-20 items-center justify-between gap-6">
        <FoundationLogo />

        <nav aria-label="Foundation" className="hidden xl:block">
          <ul className="flex items-center gap-6 whitespace-nowrap">
            {NAV.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <li key={item.to}>
                  <Link
                    href={item.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative py-2 text-[0.88rem] text-islf-ink/75 transition-colors hover:text-islf-ink",
                      active &&
                        "text-islf-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-islf-magenta",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <DropdownMenu
              pathname={pathname}
              heading={`Issued by ${FOUNDATION.name}`}
              {...PUBLICATIONS_GROUP}
            />
            <DropdownMenu pathname={pathname} heading="Published & upcoming" {...BOOKS_GROUP} />
            <li>
              <Link
                href={FOUNDATION_ROUTES.contact}
                aria-current={isActive(pathname, FOUNDATION_ROUTES.contact) ? "page" : undefined}
                className="py-2 text-[0.88rem] text-islf-ink/75 transition-colors hover:text-islf-ink"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={FOUNDATION_ROUTES.publications}
            className="hidden h-11 items-center gap-2 bg-islf-indigo px-5 text-sm font-semibold whitespace-nowrap text-islf-paper transition-colors hover:bg-islf-indigo-deep sm:inline-flex"
          >
            Explore Publications <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="islf-mobile-nav"
            aria-label="Toggle navigation"
            className="grid size-11 place-items-center border border-islf-stone text-islf-ink xl:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </Wrap>

      {mobileOpen ? (
        <nav
          id="islf-mobile-nav"
          aria-label="Foundation mobile"
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-islf-stone bg-islf-paper xl:hidden"
        >
          <Wrap className="grid gap-1 py-4">
            {[...NAV, { label: "Contact", to: FOUNDATION_ROUTES.contact }].map((item) => (
              <Link
                key={item.to}
                href={item.to}
                aria-current={isActive(pathname, item.to) ? "page" : undefined}
                className="px-1 py-2.5 font-islf-serif text-lg text-islf-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-b border-islf-stone">
              <MobileGroup {...PUBLICATIONS_GROUP} />
              <MobileGroup {...BOOKS_GROUP} />
            </div>
            <Link
              href={FOUNDATION_ROUTES.publications}
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 bg-islf-indigo px-5 text-sm font-semibold text-islf-paper"
            >
              Explore Publications <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Wrap>
        </nav>
      ) : null}
    </header>
  );
}
