import { Link } from "@tanstack/react-router";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { primaryNav, actionNav } from "@/data/navigation";
import { Action, Container } from "./primitives";
import mark from "@/assets/life-sutra-emblem.png.asset.json";

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img
        src={mark.url}
        alt="Life Sutra emblem"
        className="h-11 w-auto shrink-0"
        width={44}
        height={50}
      />
      <span className="leading-tight">
        <span className="block font-display text-lg tracking-tight text-ink">Life Sutra</span>
        <span className="block text-[0.6rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Journal of Mind, Consciousness Studies &amp; Indian Knowledge Systems
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur">
      <div className="border-b border-rule/60 bg-earth text-earth-foreground">
        <Container className="flex h-9 items-center justify-between text-[0.7rem] tracking-wide">
          <p className="hidden sm:block">
            ISSN 2947-4412 · Peer-reviewed · Open abstracts
          </p>
          <p className="flex items-center gap-4">
            <span className="hidden md:inline">Vol. 6, Issue 2 — July 2026</span>
            <Link to="/submit-research" className="link-underline font-semibold">
              Call for Papers open
            </Link>
          </p>
        </Container>
      </div>

      <Container className="flex h-18 items-center justify-between gap-6 py-3">
        <Wordmark />
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search the journal"
            className="hidden size-10 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground lg:grid"
          >
            <Search className="size-4" />
          </button>
          <Action to="/membership" variant="outline" size="sm" className="hidden sm:inline-flex">
            Membership
          </Action>
          <Action to="/submit-research" variant="primary" size="sm" className="hidden sm:inline-flex">
            Submit Research
          </Action>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="grid size-10 place-items-center rounded-md border border-border text-foreground lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </Container>

      <nav className="hidden border-t border-border lg:block" aria-label="Main">
        <Container>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5 text-[0.82rem] font-medium">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="link-underline text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: "text-primary" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      {open ? (
        <nav className="border-t border-border bg-card lg:hidden" aria-label="Mobile">
          <Container className="grid gap-1 py-4">
            {[...primaryNav, ...actionNav].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex flex-col rounded-md px-3 py-2.5 transition-colors hover:bg-muted"
                activeProps={{ className: "bg-muted" }}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                {item.description ? (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                ) : null}
              </Link>
            ))}
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
