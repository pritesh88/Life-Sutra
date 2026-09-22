"use client";

import { useState } from "react";
import { Confirm } from "@/components/admin/Confirm";
import {
  Mono,
  Pill,
  RECOMMENDATION_LABEL,
  StatusPill,
  buttonClass,
  controlClass,
  ErrorNote,
  fmtDate,
  fmtDateTime,
  LoadingRows,
  primaryButtonClass,
} from "@/components/admin/kit";
import type { EditorialArticle } from "@/components/admin/types";
import { useApi } from "@/components/admin/useApi";
import { authRequest } from "@/components/auth/AuthProvider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Permission } from "@/lib/auth/rbac/catalog";

type Props = {
  articleId: string | null;
  permissions: string[];
  onClose: () => void;
  onChanged: () => void;
};

const DECISIONS = [
  { value: "ACCEPTED", label: "Accept" },
  { value: "REVISION_REQUESTED", label: "Request revision" },
  { value: "REJECTED", label: "Reject" },
] as const;

/**
 * Manuscript detail + editorial actions. Reads `/api/editor/articles/:id` and
 * writes through the existing assignment / decision / publish endpoints — the
 * server decides what this user may see (identities, confidential comments)
 * and do; the buttons here only mirror that.
 */
export function SubmissionDrawer({ articleId, permissions, onClose, onChanged }: Props) {
  const has = (permission: Permission) => permissions.includes(permission);
  const detail = useApi<{ article: EditorialArticle }>(
    articleId ? `/api/editor/articles/${articleId}` : null,
  );
  const article = detail.data?.article;
  const open = articleId !== null;
  const inReview = article?.status === "SUBMITTED" || article?.status === "UNDER_REVIEW";

  return (
    <Sheet open={open} onOpenChange={(value) => (value ? undefined : onClose())}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-rule/70 px-5 py-4 text-left">
          <SheetTitle className="pr-8 text-lg leading-snug">
            {article?.title ?? "Manuscript"}
          </SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {article ? (
                <>
                  <Mono>{article.manuscriptCode}</Mono>
                  <StatusPill status={article.status} />
                  <span className="text-muted-foreground">
                    Submitted {fmtDate(article.submittedAt)}
                  </span>
                </>
              ) : (
                <span>Loading manuscript…</span>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        {detail.error ? <ErrorNote error={detail.error} onRetry={detail.reload} /> : null}
        {detail.loading && !article ? <LoadingRows rows={6} /> : null}

        {article ? (
          <div className="grid gap-5 px-5 py-4 text-[0.8125rem]">
            <Block label="Abstract">
              <p className="leading-relaxed whitespace-pre-wrap">{article.abstract}</p>
            </Block>

            <Block label="Author">
              {article.author ? (
                <p>
                  {article.author.name} <Mono>{article.author.email}</Mono>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Anonymised — your role does not include access to author identities.
                </p>
              )}
              {article.manuscriptFile ? <Mono>{article.manuscriptFile}</Mono> : null}
            </Block>

            <Block label={`Reviewers (${article.assignments.length})`}>
              {article.assignments.length === 0 ? (
                <p className="text-muted-foreground">No reviewers assigned yet.</p>
              ) : (
                <ul className="grid gap-3">
                  {article.assignments.map((assignment) => (
                    <li
                      key={assignment.assignmentId}
                      className="rounded-md border border-rule/70 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">
                          {assignment.reviewer?.name ?? assignment.label}
                          {assignment.reviewer ? (
                            <span className="ml-2 font-normal text-muted-foreground">
                              {assignment.label}
                            </span>
                          ) : null}
                        </span>
                        <span className="flex items-center gap-2">
                          {assignment.review ? (
                            <Pill tone="gold">
                              {RECOMMENDATION_LABEL[assignment.review.recommendation]}
                            </Pill>
                          ) : null}
                          <Pill tone={assignment.status === "SUBMITTED" ? "leaf" : "saffron"}>
                            {assignment.status === "SUBMITTED" ? "Submitted" : "Pending"}
                          </Pill>
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Assigned {fmtDate(assignment.assignedAt)}
                        {assignment.review
                          ? ` · reviewed ${fmtDateTime(assignment.review.submittedAt)}`
                          : ""}
                      </p>
                      {assignment.review ? (
                        <div className="mt-2 grid gap-2">
                          <Quote label="To author" text={assignment.review.commentsToAuthor} />
                          {assignment.review.commentsToEditor ? (
                            <Quote
                              label="To editor (confidential)"
                              text={assignment.review.commentsToEditor}
                            />
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Block>

            {article.decisionNote ? (
              <Block label="Decision note">
                <p className="leading-relaxed whitespace-pre-wrap">{article.decisionNote}</p>
                <p className="text-xs text-muted-foreground">
                  Recorded {fmtDateTime(article.decidedAt)}
                </p>
              </Block>
            ) : null}

            {has("review:assign") && inReview ? (
              <AssignReviewer article={article} onDone={() => (detail.reload(), onChanged())} />
            ) : null}
            {has("article:review") && inReview ? (
              <RecordDecision article={article} onDone={() => (detail.reload(), onChanged())} />
            ) : null}
            {has("article:publish") && article.status === "ACCEPTED" ? (
              <PublishArticle article={article} onDone={() => (detail.reload(), onChanged())} />
            ) : null}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-1.5">
      <h3 className="eyebrow">{label}</h3>
      {children}
    </section>
  );
}

function Quote({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-sm border-l-2 border-gold/70 bg-muted/40 px-3 py-2">
      <p className="text-[0.66rem] font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function useAction() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(task: () => Promise<unknown>, done: () => void) {
    setBusy(true);
    setError(null);
    try {
      await task();
      done();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return { error, busy, run };
}

function ActionBlock({
  title,
  children,
  error,
}: {
  title: string;
  children: React.ReactNode;
  error: string | null;
}) {
  return (
    <section className="grid gap-2 rounded-md border border-border bg-parchment/50 p-3">
      <h3 className="eyebrow">{title}</h3>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function AssignReviewer({ article, onDone }: { article: EditorialArticle; onDone: () => void }) {
  const reviewers = useApi<{ reviewers: { id: string; name: string }[] }>("/api/editor/reviewers");
  const [reviewerId, setReviewerId] = useState("");
  const { error, busy, run } = useAction();
  const taken = new Set(article.assignments.flatMap((a) => (a.reviewer ? [a.reviewer.id] : [])));
  const options = (reviewers.data?.reviewers ?? []).filter(
    (r) => !taken.has(r.id) && r.id !== article.author?.id,
  );

  return (
    <ActionBlock title="Assign a reviewer" error={error ?? reviewers.error?.message ?? null}>
      <div className="flex flex-wrap gap-2">
        <select
          aria-label="Reviewer"
          className={`${controlClass} min-w-56 flex-1`}
          value={reviewerId}
          onChange={(event) => setReviewerId(event.target.value)}
        >
          <option value="">Select a reviewer…</option>
          {options.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={primaryButtonClass}
          disabled={!reviewerId || busy}
          onClick={() =>
            void run(
              () => authRequest(`/api/editor/articles/${article.id}/assignments`, { reviewerId }),
              () => {
                setReviewerId("");
                onDone();
              },
            )
          }
        >
          {busy ? "Assigning…" : "Assign"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Reviewers cannot see the author; the assignment is recorded in the audit log.
      </p>
    </ActionBlock>
  );
}

function RecordDecision({ article, onDone }: { article: EditorialArticle; onDone: () => void }) {
  const [decision, setDecision] =
    useState<(typeof DECISIONS)[number]["value"]>("REVISION_REQUESTED");
  const [note, setNote] = useState("");
  const { error, busy, run } = useAction();
  const label = DECISIONS.find((d) => d.value === decision)!.label;

  return (
    <ActionBlock title="Record decision" error={error}>
      <div className="flex flex-wrap gap-2">
        <select
          aria-label="Decision"
          className={controlClass}
          value={decision}
          onChange={(event) => setDecision(event.target.value as typeof decision)}
        >
          {DECISIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        aria-label="Decision note to the author"
        rows={3}
        maxLength={5000}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Note to the author (required). Reviewer comments are released with the decision."
        className={`${controlClass} h-auto w-full py-2 leading-relaxed`}
      />
      <div>
        <Confirm
          trigger={
            <button type="button" className={buttonClass} disabled={!note.trim() || busy}>
              {busy ? "Saving…" : "Record decision"}
            </button>
          }
          title={`${label}?`}
          description="The decision is final for this round and releases the reviewers' comments to the author."
          confirmLabel={label}
          onConfirm={() =>
            void run(
              () =>
                authRequest(`/api/editor/articles/${article.id}/decision`, {
                  decision,
                  note: note.trim(),
                }),
              onDone,
            )
          }
        />
      </div>
    </ActionBlock>
  );
}

function PublishArticle({ article, onDone }: { article: EditorialArticle; onDone: () => void }) {
  const { error, busy, run } = useAction();
  return (
    <ActionBlock title="Publish" error={error}>
      <p className="text-xs text-muted-foreground">This manuscript has been accepted.</p>
      <div>
        <Confirm
          trigger={
            <button type="button" className={primaryButtonClass} disabled={busy}>
              {busy ? "Publishing…" : "Publish article"}
            </button>
          }
          title="Publish this article?"
          description="It will be marked as published. This is recorded in the audit log."
          confirmLabel="Publish"
          onConfirm={() =>
            void run(() => authRequest(`/api/editor/articles/${article.id}/publish`), onDone)
          }
        />
      </div>
    </ActionBlock>
  );
}
