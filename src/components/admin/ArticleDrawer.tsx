"use client";

import { useState } from "react";
import { Confirm } from "@/components/admin/Confirm";
import {
  ErrorNote,
  LoadingRows,
  Mono,
  Pill,
  RECOMMENDATION_LABEL,
  StatusPill,
  buttonClass,
  controlClass,
  fmtDate,
  fmtDateTime,
  primaryButtonClass,
} from "@/components/admin/kit";
import type { EditorialArticle } from "@/components/admin/types";
import { useApi } from "@/components/admin/useApi";
import { authRequest } from "@/components/auth/AuthProvider";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { canAny } from "@/lib/auth/rbac/authorize";
import type { Permission } from "@/lib/auth/rbac/catalog";

type Decision = "ACCEPTED" | "REVISION_REQUESTED" | "REJECTED";

/**
 * Full manuscript record for editors. Data and every action go through the
 * existing editorial endpoints — this component adds no rules of its own; it
 * only shows the controls the caller's permissions (and the article's status)
 * make available. The server decides.
 */
export function ArticleDrawer({
  articleId,
  permissions,
  onClose,
  onChanged,
}: {
  articleId: string | null;
  permissions: string[];
  onClose: () => void;
  onChanged: () => void;
}) {
  return (
    <Sheet open={articleId !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetTitle className="sr-only">Manuscript detail</SheetTitle>
        <SheetDescription className="sr-only">
          Abstract, reviewers, reviews and editorial actions.
        </SheetDescription>
        {articleId ? (
          <DrawerBody
            key={articleId}
            articleId={articleId}
            permissions={permissions}
            onChanged={onChanged}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  articleId,
  permissions,
  onChanged,
}: {
  articleId: string;
  permissions: string[];
  onChanged: () => void;
}) {
  const detail = useApi<{ article: EditorialArticle }>(`/api/editor/articles/${articleId}`);
  const has = (list: Permission[]) => canAny({ permissions: permissions as Permission[] }, list);
  const article = detail.data?.article;

  const canAssign = has(["review:assign"]);
  const canDecide = has(["article:review"]);
  const canPublish = has(["article:publish"]);
  const inReview = article?.status === "SUBMITTED" || article?.status === "UNDER_REVIEW";

  return (
    <div className="pb-8">
      {detail.error ? <ErrorNote error={detail.error} onRetry={detail.reload} /> : null}
      {detail.loading && !article ? <LoadingRows rows={8} /> : null}
      {article ? (
        <>
          <header className="border-b border-rule/70 bg-parchment/60 px-6 py-5 pr-12">
            <div className="flex items-center gap-2">
              <Mono>{article.manuscriptCode}</Mono>
              <StatusPill status={article.status} />
            </div>
            <h2 className="mt-2 text-xl leading-snug">{article.title}</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Submitted {fmtDate(article.submittedAt)}
              {article.decidedAt ? ` · Decided ${fmtDate(article.decidedAt)}` : ""}
              {article.publishedAt ? ` · Published ${fmtDate(article.publishedAt)}` : ""}
            </p>
          </header>

          <div className="space-y-6 px-6 pt-5">
            <Section title="Author">
              {article.author ? (
                <p className="text-[0.8125rem]">
                  {article.author.name}{" "}
                  <span className="text-muted-foreground">· {article.author.email}</span>
                </p>
              ) : (
                <p className="text-[0.8125rem] text-muted-foreground">
                  Identity hidden — your role does not include access to author identities.
                </p>
              )}
              {article.manuscriptFile ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  File: <span className="font-mono">{article.manuscriptFile}</span>
                </p>
              ) : null}
            </Section>

            <Section title="Abstract">
              <p className="text-[0.8125rem] leading-relaxed whitespace-pre-line">
                {article.abstract}
              </p>
            </Section>

            <Section title={`Reviews (${article.assignments.length})`}>
              {article.assignments.length === 0 ? (
                <p className="text-[0.8125rem] text-muted-foreground">No reviewers assigned yet.</p>
              ) : (
                <ul className="space-y-3">
                  {article.assignments.map((assignment) => (
                    <li
                      key={assignment.assignmentId}
                      className="rounded-md border border-border bg-background p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[0.8125rem] font-semibold">
                          {assignment.reviewer?.name ?? assignment.label}
                          {assignment.reviewer ? (
                            <span className="ml-2 font-normal text-muted-foreground">
                              {assignment.label}
                            </span>
                          ) : null}
                        </span>
                        <span className="flex items-center gap-2">
                          {assignment.review ? (
                            <Pill tone="leaf">
                              {RECOMMENDATION_LABEL[assignment.review.recommendation]}
                            </Pill>
                          ) : null}
                          <Pill tone={assignment.status === "SUBMITTED" ? "leaf" : "saffron"}>
                            {assignment.status === "SUBMITTED" ? "Submitted" : "Pending"}
                          </Pill>
                        </span>
                      </div>
                      {assignment.review ? (
                        <div className="mt-2 space-y-2 text-[0.8125rem] leading-relaxed">
                          <p className="whitespace-pre-line">
                            {assignment.review.commentsToAuthor}
                          </p>
                          {assignment.review.commentsToEditor ? (
                            <p className="rounded-sm border border-gold/50 bg-gold/10 px-2 py-1.5 whitespace-pre-line">
                              <span className="eyebrow mr-2">To editor</span>
                              {assignment.review.commentsToEditor}
                            </p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            Submitted {fmtDateTime(assignment.review.submittedAt)}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Assigned {fmtDate(assignment.assignedAt)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {article.decisionNote ? (
              <Section title="Decision note">
                <p className="text-[0.8125rem] whitespace-pre-line">{article.decisionNote}</p>
              </Section>
            ) : null}

            {(canAssign && inReview) ||
            (canDecide && inReview) ||
            (canPublish && article.status === "ACCEPTED") ? (
              <Section title="Actions">
                <div className="space-y-4">
                  {canAssign && inReview ? (
                    <AssignReviewer
                      article={article}
                      onDone={() => {
                        detail.reload();
                        onChanged();
                      }}
                    />
                  ) : null}
                  {canDecide && inReview ? (
                    <RecordDecision
                      article={article}
                      onDone={() => {
                        detail.reload();
                        onChanged();
                      }}
                    />
                  ) : null}
                  {canPublish && article.status === "ACCEPTED" ? (
                    <PublishAction
                      article={article}
                      onDone={() => {
                        detail.reload();
                        onChanged();
                      }}
                    />
                  ) : null}
                </div>
              </Section>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="eyebrow mb-2">{title}</h3>
      {children}
    </section>
  );
}

function useAction(onDone: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(task: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await task();
      onDone();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, run };
}

function AssignReviewer({ article, onDone }: { article: EditorialArticle; onDone: () => void }) {
  const reviewers = useApi<{ reviewers: { id: string; name: string }[] }>("/api/editor/reviewers");
  const [reviewerId, setReviewerId] = useState("");
  const { busy, error, run } = useAction(() => {
    setReviewerId("");
    onDone();
  });
  const taken = new Set(article.assignments.map((a) => a.reviewer?.id));
  const options = (reviewers.data?.reviewers ?? []).filter(
    (r) => !taken.has(r.id) && r.id !== article.author?.id,
  );

  return (
    <div>
      <label className="text-xs font-semibold" htmlFor="assign-reviewer">
        Assign a reviewer
      </label>
      <div className="mt-1 flex gap-2">
        <select
          id="assign-reviewer"
          className={`${controlClass} min-w-0 flex-1`}
          value={reviewerId}
          onChange={(event) => setReviewerId(event.target.value)}
        >
          <option value="">Select a reviewer…</option>
          {options.map((reviewer) => (
            <option key={reviewer.id} value={reviewer.id}>
              {reviewer.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={primaryButtonClass}
          disabled={!reviewerId || busy}
          onClick={() =>
            void run(() =>
              authRequest(`/api/editor/articles/${article.id}/assignments`, { reviewerId }),
            )
          }
        >
          Assign
        </button>
      </div>
      {reviewers.error ? (
        <p className="mt-1 text-xs text-destructive">{reviewers.error.message}</p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function RecordDecision({ article, onDone }: { article: EditorialArticle; onDone: () => void }) {
  const [decision, setDecision] = useState<Decision>("REVISION_REQUESTED");
  const [note, setNote] = useState("");
  const { busy, error, run } = useAction(() => {
    setNote("");
    onDone();
  });
  const label: Record<Decision, string> = {
    ACCEPTED: "Accept",
    REVISION_REQUESTED: "Request revision",
    REJECTED: "Reject",
  };

  return (
    <div>
      <label className="text-xs font-semibold" htmlFor="decision">
        Editorial decision
      </label>
      <div className="mt-1 grid gap-2">
        <select
          id="decision"
          className={controlClass}
          value={decision}
          onChange={(event) => setDecision(event.target.value as Decision)}
        >
          {(Object.keys(label) as Decision[]).map((key) => (
            <option key={key} value={key}>
              {label[key]}
            </option>
          ))}
        </select>
        <textarea
          className={`${controlClass} h-20 py-1.5`}
          placeholder="Decision note (shared with the author)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <div>
          <Confirm
            trigger={
              <button type="button" className={buttonClass} disabled={!note.trim() || busy}>
                Record decision…
              </button>
            }
            title={`${label[decision]} this manuscript?`}
            description="The decision is final for this round, is recorded in the audit log, and releases the reviewers' comments (anonymised) to the author."
            confirmLabel={label[decision]}
            onConfirm={() =>
              void run(() =>
                authRequest(`/api/editor/articles/${article.id}/decision`, {
                  decision,
                  note: note.trim(),
                }),
              )
            }
          />
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PublishAction({ article, onDone }: { article: EditorialArticle; onDone: () => void }) {
  const { busy, error, run } = useAction(onDone);
  return (
    <div>
      <Confirm
        trigger={
          <button type="button" className={primaryButtonClass} disabled={busy}>
            Publish article…
          </button>
        }
        title="Publish this article?"
        description="The article moves to Published and is recorded in the audit log."
        confirmLabel="Publish"
        onConfirm={() => void run(() => authRequest(`/api/editor/articles/${article.id}/publish`))}
      />
      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
