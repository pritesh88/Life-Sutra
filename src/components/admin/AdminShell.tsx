"use client";

import {
  BookOpenCheck,
  ClipboardCheck,
  Inbox,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { titleCase } from "@/components/admin/kit";
import { visibleSections, type AdminSectionKey } from "@/lib/admin/sections";
import { cn } from "@/lib/utils";
import { ASSETS } from "@/lib/site";

const ICONS: Record<AdminSectionKey, LucideIcon> = {
  overview: LayoutDashboard,
  submissions: Inbox,
  reviews: ClipboardCheck,
  articles: BookOpenCheck,
  users: Users,
  roles: ShieldCheck,
  audit: ScrollText,
};

export type AdminShellUser = {
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
};

/**
 * Navigation is built from the server-verified permission list, but it is only
 * a convenience: each page and API call authorizes again on the server.
 */
export function AdminShell({ user, children }: { user: AdminShellUser; children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const items = visibleSections(user);
  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  const link = (item: (typeof items)[number], layout: "side" | "top") => {
    const Icon = ICONS[item.key];
    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={isActive(item.href) ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-md text-[0.8125rem] font-medium whitespace-nowrap transition-colors",
          layout === "side" ? "px-2.5 py-1.5" : "px-3 py-2",
          isActive(item.href)
            ? "bg-card font-semibold text-ink shadow-[inset_2px_0_0_var(--saffron)]"
            : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-12 items-center gap-4 border-b border-border bg-card px-4">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src={ASSETS.emblem} alt="" width={44} height={50} className="h-7 w-auto" />
          <span className="font-display text-base text-ink">Life Sutra</span>
          <span className="eyebrow hidden sm:inline">Administration</span>
        </Link>
        <div className="ml-auto flex items-center gap-4 text-xs">
          <span className="hidden text-right leading-tight sm:block">
            <span className="block font-semibold text-foreground">{user.name}</span>
            <span className="block text-muted-foreground">
              {user.roles.map(titleCase).join(", ")}
            </span>
          </span>
          <Link href="/" className="link-underline font-semibold text-primary">
            View site
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="font-semibold text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-parchment/55 p-3 md:block">
          <nav aria-label="Administration" className="sticky top-16 grid gap-0.5">
            {items.map((item) => link(item, "side"))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <nav
            aria-label="Administration"
            className="flex overflow-x-auto border-b border-border bg-parchment/55 px-2 md:hidden"
          >
            {items.map((item) => link(item, "top"))}
          </nav>
          <main className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
