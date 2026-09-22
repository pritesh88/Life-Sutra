"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ArticleStatus, Recommendation } from "@/components/admin/types";
import { ApiFailure } from "@/components/admin/useApi";

/**
 * Admin UI vocabulary, built on the site's tokens (parchment / ivory / ink,
 * Spectral for headings, Karla for text, Plex Mono for codes). Dense and quiet:
 * hairline rules, no shadows on rows, no motion beyond colour.
 */

export const controlClass =
  "h-8 rounded-md border border-input bg-card px-2.5 text-[0.8125rem] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-60";

export const buttonClass = cn(
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-[0.8125rem] font-semibold text-foreground transition-colors",
  "hover:border-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-55",
);
export const primaryButtonClass = cn(
  buttonClass,
  "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:border-primary",
);
export const dangerButtonClass = cn(
  buttonClass,
  "border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/8",
);

export function PageTitle({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[1.65rem] leading-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-[0.8125rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  flush = false,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section className={cn("rounded-md border border-border bg-card", className)}>
      {title || action ? (
        <header className="flex items-center justify-between gap-3 border-b border-rule/70 px-4 py-2.5">
          <h2 className="eyebrow">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}

type Tone = "neutral" | "saffron" | "leaf" | "gold" | "danger";

const toneClass: Record<Tone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  saffron: "border-saffron/40 bg-saffron/12 text-earth",
  leaf: "border-leaf/35 bg-leaf/10 text-leaf",
  gold: "border-gold/50 bg-gold/15 text-earth",
  danger: "border-destructive/35 bg-destructive/8 text-destructive",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-px text-[0.68rem] font-semibold tracking-wide whitespace-nowrap",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  REVISION_REQUESTED: "Revision requested",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
};
const STATUS_TONE: Record<ArticleStatus, Tone> = {
  DRAFT: "neutral",
  SUBMITTED: "saffron",
  UNDER_REVIEW: "gold",
  REVISION_REQUESTED: "gold",
  ACCEPTED: "leaf",
  REJECTED: "danger",
  PUBLISHED: "leaf",
};

export const StatusPill = ({ status }: { status: ArticleStatus }) => (
  <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
);

export const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  ACCEPT: "Accept",
  MINOR_REVISION: "Minor revision",
  MAJOR_REVISION: "Major revision",
  REJECT: "Reject",
};

export const OutcomePill = ({ outcome }: { outcome: "SUCCESS" | "DENIED" | "FAILURE" }) => (
  <Pill tone={outcome === "SUCCESS" ? "leaf" : outcome === "DENIED" ? "saffron" : "danger"}>
    {outcome.toLowerCase()}
  </Pill>
);

// --- Tables -----------------------------------------------------------------

export const Table = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full border-collapse text-left text-[0.8125rem]", className)}>
      {children}
    </table>
  </div>
);

export const Th = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th
    scope="col"
    className={cn(
      "border-b border-rule/80 bg-muted/40 px-3 py-2 text-[0.66rem] font-bold tracking-[0.12em] whitespace-nowrap text-muted-foreground uppercase",
      className,
    )}
  >
    {children}
  </th>
);

export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn("border-b border-rule/50 px-3 py-2 align-middle", className)}>{children}</td>
);

export const Mono = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("font-mono text-[0.75rem] text-muted-foreground", className)}>
    {children}
  </span>
);

// --- States -----------------------------------------------------------------

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-8 text-center text-[0.8125rem] text-muted-foreground">{children}</p>;
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-5 animate-pulse rounded-sm bg-muted" />
      ))}
    </div>
  );
}

export function ErrorNote({ error, onRetry }: { error: ApiFailure; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/35 bg-destructive/8 px-3 py-2 text-[0.8125rem] text-destructive"
    >
      <span>{error.message}</span>
      <span className="flex gap-3">
        {error.status === 401 ? (
          <Link className="font-semibold underline" href="/auth/login?next=/admin">
            Sign in
          </Link>
        ) : null}
        {onRetry ? (
          <button className="font-semibold underline" onClick={onRetry} type="button">
            Retry
          </button>
        ) : null}
      </span>
    </div>
  );
}

export function LoadMore({
  shown,
  total,
  hasMore,
  loading,
  onMore,
}: {
  shown: number;
  total: number | null;
  hasMore: boolean;
  loading: boolean;
  onMore: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-rule/70 px-4 py-2 text-xs text-muted-foreground">
      <span>
        {shown}
        {total !== null ? ` of ${total}` : ""} shown
      </span>
      {hasMore ? (
        <button className={buttonClass} disabled={loading} onClick={onMore} type="button">
          {loading ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </div>
  );
}

// --- Formatting -------------------------------------------------------------

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const fmtDate = (iso: string | null) => (iso ? dateFormat.format(new Date(iso)) : "—");
export const fmtDateTime = (iso: string | null) =>
  iso ? dateTimeFormat.format(new Date(iso)) : "—";

export function daysSince(iso: string | null) {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export const ageLabel = (iso: string | null) => {
  const days = daysSince(iso);
  return days === null ? "—" : days === 0 ? "today" : `${days}d`;
};

export const titleCase = (code: string) =>
  code
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
