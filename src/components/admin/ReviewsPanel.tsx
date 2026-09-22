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
  Pill,
  RECOMMENDATION_LABEL,
  StatusPill,
  Table,
  Td,
  Th,
  ageLabel,
  controlClass,
  fmtDate,
} from "@/components/admin/kit";
import type { ReviewRow } from "@/components/admin/types";
import { useDebounced, usePaged, withParams } from "@/components/admin/useApi";

export function ReviewsPanel({
  permissions,
  initial,
}: {
  permissions: string[];
  initial: { status?: string | undefined };
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(
    initial.status === "PENDING" || initial.status === "SUBMITTED" ? initial.status : "",
  );
  const [open, setOpen] = useState<string | null>(null);
  const search = useDebounced(q.trim());

  const list = usePaged<"reviews", ReviewRow>(
    withParams("/api/admin/reviews", {
      status,
      q: search,
      order: status === "PENDING" ? "asc" : "desc",
      limit: 25,
    }),
    "reviews",
  );

  return (
    <>
      <PageTitle
        title="Peer review"
        description="Review assignments across all manuscripts. Reviewer identities appear only to roles that hold identity access; everyone else sees ordinal labels."
      />
      <Panel flush>
        <div className="flex flex-wrap items-center gap-2 border-b border-rule/70 p-3">
          <input
            aria-label="Search"
            className={`${controlClass} w-56`}
            placeholder="Search manuscript or reviewer…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
          <select
            aria-label="Review status"
            className={controlClass}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All reviews</option>
            <option value="PENDING">Pending</option>
            <option value="SUBMITTED">Submitted</option>
          </select>
        </div>

        {list.error ? <ErrorNote error={list.error} onRetry={list.reload} /> : null}
        {list.loading && list.items.length === 0 ? <LoadingRows /> : null}
        {!list.loading && !list.error && list.items.length === 0 ? (
          <Empty>No review assignments match these filters.</Empty>
        ) : null}
        {list.items.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Manuscript</Th>
                <Th>Reviewer</Th>
                <Th>Review</Th>
                <Th>Recommendation</Th>
                <Th>Manuscript status</Th>
                <Th>Assigned</Th>
                <Th>
                  <span className="sr-only">Open</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((row) => (
                <tr key={row.assignmentId} className="hover:bg-muted/40">
                  <Td className="max-w-[24rem]">
                    <span className="line-clamp-1 font-medium">{row.article.title}</span>
                    <Mono>{row.article.code}</Mono>
                  </Td>
                  <Td>
                    {row.reviewer?.name ?? row.label}
                    {row.reviewer ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">{row.label}</span>
                    ) : null}
                  </Td>
                  <Td>
                    <Pill tone={row.status === "SUBMITTED" ? "leaf" : "saffron"}>
                      {row.status === "SUBMITTED" ? "Submitted" : "Pending"}
                    </Pill>
                  </Td>
                  <Td className="text-muted-foreground">
                    {row.recommendation ? RECOMMENDATION_LABEL[row.recommendation] : "—"}
                  </Td>
                  <Td>
                    <StatusPill status={row.article.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-muted-foreground">
                    {fmtDate(row.assignedAt)}
                    {row.status === "PENDING" ? (
                      <span className="ml-1.5 text-xs">· waiting {ageLabel(row.assignedAt)}</span>
                    ) : null}
                  </Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={() => setOpen(row.article.id)}
                    >
                      Manuscript
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
