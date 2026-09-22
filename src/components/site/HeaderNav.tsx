"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { actionNav, primaryNav } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { Action, Container } from "./primitives";

export function HeaderActions() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <>
      <div className="flex items-center gap-2">
        <Action to="/membership" variant="outline" size="sm" className="hidden sm:inline-flex">
          Membership
        </Action>
        <Action to="/submit-research" variant="primary" size="sm" className="hidden sm:inline-flex">
          Submit Research
        </Action>
        {!loading && !user ? (
          <>
            <Action to="/auth/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign in
            </Action>
            <Action
              to="/auth/register"
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Register
            </Action>
          </>
        ) : null}
        {!loading && user ? (
          <>
            <Action to="/profile" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Profile
            </Action>
            <button
              type="button"
              onClick={() => void logout()}
              className="hidden h-9 px-2 text-sm font-semibold text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              Sign out
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation"
          className="grid size-10 place-items-center rounded-md border border-border text-foreground lg:hidden"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-t border-border bg-card lg:hidden"
          aria-label="Mobile"
        >
          <Container className="grid gap-1 py-4">
            {[...primaryNav, ...actionNav].map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-col rounded-md px-3 py-2.5 transition-colors hover:bg-muted",
                    active && "bg-muted",
                  )}
                >
                  <span className="text-sm font-semibold">{item.label}</span>
                  {item.description ? (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  ) : null}
                </Link>
              );
            })}
          </Container>
        </nav>
      ) : null}
    </>
  );
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden border-t border-border lg:block" aria-label="Main">
      <Container>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5 text-[0.82rem] font-medium">
          {primaryNav.map((item) => {
            const active = pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className={cn(
                    "link-underline text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-primary",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
