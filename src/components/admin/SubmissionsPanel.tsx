"use client";

import { useState } from "react";
import { ArticleDrawer } from "@/components/admin/ArticleDrawer";
import {
  Empty,
  ErrorNote,
  LoadMore,
  LoadingRows,
  Mono,
  PageTitle,
  Panel,
  StatusPill,
  STATUS_LABEL,
  Table,
  Td,
  Th,
  controlClass,
  fmtDate,
} from "@/components/admin/kit";
import type { ArticleStatus, SubmissionRow } from "@/components/admin/types";
import { useDebounced, usePaged, withParams } from "@/components/admin/useApi";

type Scope = "submissions" | "articles";

const STATUSES: Record<Scope, ArticleStatus[]> = {
  submissions: ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "REJECTED"],
  articles: ["ACCEPTED", "PUBLISHED"],
};
const QUEUES = [
  ["awaiting-assignment", "Awaiting reviewer assignment"],
  ["in-review", "In review"],
  ["ready-for-decision", "Ready for decision"],
] as const;

const COPY: Record<Scope, { title: string; description: string; empty: string }> = {
  submissions: {
    title: "Submissions",
    description:
      "Manuscripts in the peer-review pipeline. Drafts and your own manuscripts are never listed.",
    empty: "No submissions match these filters.",
  },
  articles: {
    title: "Articles",
    description: "Accepted and published articles. Publish accepted manuscripts from their record.",
    empty: "No articles match these filters.",
  },
};

export function SubmissionsPanel({
  scope,
  permissions,
  initial,
}: {
  scope: Scope;
  permissions: string[];
  initial: { status?: string | undefined; queue?: string | undefined };
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(
    STATUSES[scope].includes(initial.status as ArticleStatus) ? (initial.status ?? "") : "",
  );
  const [queue, setQueue] = useState(
    QUEUES.some(([key]) => key === initial.queue) && scope === "submissions"
      ? (initial.queue ?? "")
      : "",
  );
  const [open, setOpen] = useState<string | null>(null);
  const search = useDebounced(q.trim());

  const list = usePaged<"submissions", SubmissionRow>(
    withParams("/api/admin/submissions", {
      scope,
      status,
      queue,
      q: search,
      // Queues read best oldest-first; everything else newest-first.
      order: queue ? "asc" : "desc",
      limit: 25,
    }),
    "submissions",
  );
  const copy = COPY[scope];

  return (
    <>
      <PageTitle title={copy.title} description={copy.description} />
      <Panel flush>
        <div className="flex flex-wrap items-center gap-2 border-b border-rule/70 p-3">
          <input
            aria-label="Search by title"
            className={`${controlClass} w-56`}
            placeholder="Search title or author…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
          <select
            aria-label="Status"
            className={controlClass}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES[scope].map((key) => (
              <option key={key} value={key}>
                {STATUS_LABEL[key]}
              </option>
            ))}
          </select>
          {scope === "submissions" ? (
            <select
              aria-label="Queue"
              className={controlClass}
              value={queue}
              onChange={(event) => setQueue(event.target.value)}
            >
              <option value="">All queues</option>
              {QUEUES.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {list.error ? <ErrorNote error={list.error} onRetry={list.reload} /> : null}
        {list.loading && list.items.length === 0 ? <LoadingRows /> : null}
        {!list.loading && !list.error && list.items.length === 0 ? (
          <Empty>{copy.empty}</Empty>
        ) : null}
        {list.items.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Title</Th>
                <Th>Author</Th>
                <Th>Status</Th>
                <Th>Reviews</Th>
                <Th>{scope === "articles" ? "Published" : "Submitted"}</Th>
                <Th>
                  <span className="sr-only">Open</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((row) => (
                <tr key={row.id} className="hover:bg-muted/40">
                  <Td>
                    <Mono>{row.code}</Mono>
                  </Td>
                  <Td className="max-w-[28rem] font-medium">
                    <span className="line-clamp-2">{row.title}</span>
                  </Td>
                  <Td className="text-muted-foreground">
                    {row.author?.name ?? (
                      <span title="Hidden without identity access">Anonymised</span>
                    )}
                  </Td>
                  <Td>
                    <StatusPill status={row.status} />
                  </Td>
                  <Td className="tabular-nums text-muted-foreground">
                    {row.reviews.assigned === 0
                      ? "—"
                      : `${row.reviews.submitted}/${row.reviews.assigned}`}
                  </Td>
                  <Td className="whitespace-nowrap text-muted-foreground">
                    {fmtDate(
                      scope === "articles" ? (row.publishedAt ?? row.decidedAt) : row.submittedAt,
                    )}
                  </Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={() => setOpen(row.id)}
                    >
                      Open
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : null}
        {list.items.length > 0 ? (
          <LoadMore
            shown={list.items.length}
            total={list.total}
            hasMore={list.hasMore}
            loading={list.loading}
            onMore={list.loadMore}
          />
        ) : null}
      </Panel>

      <ArticleDrawer
        articleId={open}
        permissions={permissions}
        onClose={() => setOpen(null)}
        onChanged={list.reload}
      />
    </>
  );
}
