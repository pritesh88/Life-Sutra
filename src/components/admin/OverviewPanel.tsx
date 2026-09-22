"use client";

import Link from "next/link";
import {
  Empty,
  ErrorNote,
  LoadingRows,
  Mono,
  OutcomePill,
  PageTitle,
  Panel,
  StatusPill,
  ageLabel,
  fmtDateTime,
} from "@/components/admin/kit";
import type { AuditRow, Kpis, ReviewRow, SubmissionRow } from "@/components/admin/types";
import { useApi } from "@/components/admin/useApi";
import { EDITORIAL_ACCESS } from "@/lib/admin/sections";
import { canAny } from "@/lib/auth/rbac/authorize";
import type { Permission } from "@/lib/auth/rbac/catalog";

type CardKey = keyof Kpis["kpis"];

const CARDS: {
  key: CardKey;
  label: string;
  href: string;
  note: (k: Record<string, number>) => string;
}[] = [
  {
    key: "newSubmissions",
    label: "New submissions",
    href: "/admin/submissions?queue=awaiting-assignment",
    note: (k) => `Awaiting a reviewer · ${k["submittedLast7Days"]} received in 7 days`,
  },
  {
    key: "underReview",
    label: "Under review",
    href: "/admin/submissions?queue=in-review",
    note: () => "Manuscripts with reviewers assigned",
  },
  {
    key: "reviewsPending",
    label: "Reviews pending",
    href: "/admin/reviews?status=PENDING",
    note: () => "Reports not yet submitted",
  },
  {
    key: "decisionsPending",
    label: "Decisions pending",
    href: "/admin/submissions?queue=ready-for-decision",
    note: () => "All reviews in · editor to decide",
  },
  {
    key: "publishedArticles",
    label: "Published articles",
    href: "/admin/articles?status=PUBLISHED",
    note: (k) => `${k["publishedLast30Days"]} in the last 30 days`,
  },
  {
    key: "activeResearchers",
    label: "Active researchers",
    href: "/admin/users?group=researchers&status=active&activity=active",
    note: (k) => `of ${k["totalResearchers"]} · signed in within ${k["windowDays"]} days`,
  },
];

export function OverviewPanel({ permissions }: { permissions: string[] }) {
  const can = (list: readonly Permission[]) =>
    canAny({ permissions: permissions as Permission[] }, list);
  const kpis = useApi<Kpis>("/api/admin/dashboard");

  return (
    <>
      <PageTitle
        title="Overview"
        description="The state of the editorial pipeline and the research community, from live records."
      />

      {kpis.error ? <ErrorNote error={kpis.error} onRetry={kpis.reload} /> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.loading && !kpis.data
          ? CARDS.map((card) => (
              <div key={card.key} className="h-[7.25rem] animate-pulse rounded-md bg-muted" />
            ))
          : CARDS.filter((card) => kpis.data?.kpis[card.key]).map((card) => {
              const values = kpis.data!.kpis[card.key]!;
              return (
                <Link
                  key={card.key}
                  href={card.href}
                  className="group flex flex-col rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/60"
                >
                  <span className="eyebrow min-h-[2.4em] leading-[1.2]">{card.label}</span>
                  <span className="mt-2 font-display text-[2rem] leading-none text-ink tabular-nums">
                    {values["value"]}
                  </span>
                  <span className="mt-2 text-[0.72rem] leading-snug text-muted-foreground">
                    {card.note(values)}
                  </span>
                </Link>
              );
            })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {can(EDITORIAL_ACCESS) ? (
          <>
            <QueueWidget
              title="Awaiting reviewer assignment"
              href="/admin/submissions?queue=awaiting-assignment"
              url="/api/admin/submissions?scope=submissions&queue=awaiting-assignment&order=asc&limit=6"
              empty="No manuscripts are waiting for a reviewer."
            />
            <QueueWidget
              title="Ready for decision"
              href="/admin/submissions?queue=ready-for-decision"
              url="/api/admin/submissions?scope=submissions&queue=ready-for-decision&order=asc&limit=6"
              empty="No manuscripts are waiting for a decision."
            />
            <PendingReviewsWidget />
          </>
        ) : null}
        {can(["audit:view"]) ? <ActivityWidget /> : null}
      </div>
    </>
  );
}

function QueueWidget({
  title,
  href,
  url,
  empty,
}: {
  title: string;
  href: string;
  url: string;
  empty: string;
}) {
  const { data, error, loading, reload } = useApi<{ submissions: SubmissionRow[] }>(url);
  return (
    <Panel
      title={title}
      flush
      action={
        <Link href={href} className="text-xs font-semibold text-primary">
          View all
        </Link>
      }
    >
      {error ? <ErrorNote error={error} onRetry={reload} /> : null}
      {loading && !data ? <LoadingRows rows={3} /> : null}
      {data && data.submissions.length === 0 ? <Empty>{empty}</Empty> : null}
      <ul>
        {data?.submissions.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 border-b border-rule/50 px-4 py-2 last:border-0"
          >
            <span className="min-w-0">
              <span className="block truncate text-[0.8125rem] font-medium">{row.title}</span>
              <Mono>
                {row.code}
                {row.author ? ` · ${row.author.name}` : ""}
              </Mono>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
              <span title="Time since submission">{ageLabel(row.submittedAt)}</span>
              <StatusPill status={row.status} />
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function PendingReviewsWidget() {
  const { data, error, loading, reload } = useApi<{ reviews: ReviewRow[] }>(
    "/api/admin/reviews?status=PENDING&order=asc&limit=6",
  );
  return (
    <Panel
      title="Longest-waiting reviews"
      flush
      action={
        <Link href="/admin/reviews?status=PENDING" className="text-xs font-semibold text-primary">
          View all
        </Link>
      }
    >
      {error ? <ErrorNote error={error} onRetry={reload} /> : null}
      {loading && !data ? <LoadingRows rows={3} /> : null}
      {data && data.reviews.length === 0 ? <Empty>No reviews are outstanding.</Empty> : null}
      <ul>
        {data?.reviews.map((row) => (
          <li
            key={row.assignmentId}
            className="flex items-center justify-between gap-3 border-b border-rule/50 px-4 py-2 last:border-0"
          >
            <span className="min-w-0">
              <span className="block truncate text-[0.8125rem] font-medium">
                {row.article.title}
              </span>
              <Mono>
                {row.article.code} · {row.reviewer?.name ?? row.label}
              </Mono>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              waiting {ageLabel(row.assignedAt)}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ActivityWidget() {
  const { data, error, loading, reload } = useApi<{ events: AuditRow[] }>(
    "/api/admin/audit-logs?limit=8",
  );
  return (
    <Panel
      title="Recent activity"
      flush
      action={
        <Link href="/admin/audit" className="text-xs font-semibold text-primary">
          Audit log
        </Link>
      }
    >
      {error ? <ErrorNote error={error} onRetry={reload} /> : null}
      {loading && !data ? <LoadingRows rows={4} /> : null}
      <ul>
        {data?.events.map((event) => (
          <li
            key={event.id}
            className="flex items-center justify-between gap-3 border-b border-rule/50 px-4 py-2 last:border-0"
          >
            <span className="min-w-0">
              <span className="block truncate font-mono text-[0.75rem]">{event.event}</span>
              <span className="text-xs text-muted-foreground">
                {event.actor?.name ?? "System / anonymous"}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
              {fmtDateTime(event.createdAt)}
              <OutcomePill outcome={event.outcome} />
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
