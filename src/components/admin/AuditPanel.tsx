"use client";

import { useState } from "react";
import {
  Empty,
  ErrorNote,
  LoadMore,
  LoadingRows,
  Mono,
  OutcomePill,
  PageTitle,
  Panel,
  Table,
  Td,
  Th,
  buttonClass,
  controlClass,
  fmtDateTime,
} from "@/components/admin/kit";
import type { AuditRow } from "@/components/admin/types";
import { usePaged, withParams } from "@/components/admin/useApi";

/** Local start / end of the chosen day, as ISO instants. */
const startOfDay = (value: string) =>
  value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
const endOfDay = (value: string) =>
  value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined;

export function AuditPanel() {
  const [event, setEvent] = useState("");
  const [outcome, setOutcome] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [actorId, setActorId] = useState<{ id: string; name: string } | null>(null);

  const list = usePaged<"events", AuditRow>(
    withParams("/api/admin/audit-logs", {
      event,
      outcome,
      actorId: actorId?.id,
      from: startOfDay(from),
      to: endOfDay(to),
      limit: 50,
    }),
    "events",
  );
  // The event dropdown is populated from what the log actually contains.
  const knownEvents = list.eventTypes ?? [];

  const filtered = Boolean(event || outcome || from || to || actorId);

  return (
    <>
      <PageTitle
        title="Audit log"
        description="An append-only record of security-relevant events. Entries cannot be edited or deleted — not through this application and not by the database."
      />
      <Panel flush>
        <div className="flex flex-wrap items-center gap-2 border-b border-rule/70 p-3">
          <select
            aria-label="Event"
            className={controlClass}
            value={event}
            onChange={(e) => setEvent(e.target.value)}
          >
            <option value="">All events</option>
            {(knownEvents.includes(event) || !event ? knownEvents : [...knownEvents, event]).map(
              (name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ),
            )}
          </select>
          <select
            aria-label="Outcome"
            className={controlClass}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            <option value="">Any outcome</option>
            <option value="SUCCESS">Success</option>
            <option value="DENIED">Denied</option>
            <option value="FAILURE">Failure</option>
          </select>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            From
            <input
              type="date"
              className={controlClass}
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            To
            <input
              type="date"
              className={controlClass}
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          {actorId ? (
            <button type="button" className={buttonClass} onClick={() => setActorId(null)}>
              Actor: {actorId.name} ✕
            </button>
          ) : null}
          {filtered ? (
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => {
                setEvent("");
                setOutcome("");
                setFrom("");
                setTo("");
                setActorId(null);
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {list.error ? <ErrorNote error={list.error} onRetry={list.reload} /> : null}
        {list.loading && list.items.length === 0 ? <LoadingRows rows={8} /> : null}
        {!list.loading && !list.error && list.items.length === 0 ? (
          <Empty>No audit entries match these filters.</Empty>
        ) : null}
        {list.items.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Time</Th>
                <Th>Event</Th>
                <Th>Outcome</Th>
                <Th>Actor</Th>
                <Th>Target</Th>
                <Th>Address</Th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((row) => (
                <tr key={row.id} className="align-top hover:bg-muted/40">
                  <Td className="whitespace-nowrap text-muted-foreground">
                    {fmtDateTime(row.createdAt)}
                  </Td>
                  <Td>
                    <details>
                      <summary className="cursor-pointer font-mono text-[0.75rem]">
                        {row.event}
                      </summary>
                      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <dt>Entry</dt>
                        <dd className="font-mono">{row.id}</dd>
                        {row.resource ? (
                          <>
                            <dt>Permission</dt>
                            <dd className="font-mono">
                              {row.resource}:{row.action}
                            </dd>
                          </>
                        ) : null}
                        {row.metadata ? (
                          <>
                            <dt>Details</dt>
                            <dd>
                              <pre className="max-w-md overflow-x-auto rounded-sm bg-muted p-2 font-mono text-[0.7rem] whitespace-pre-wrap">
                                {JSON.stringify(row.metadata, null, 2)}
                              </pre>
                            </dd>
                          </>
                        ) : null}
                      </dl>
                    </details>
                  </Td>
                  <Td>
                    <OutcomePill outcome={row.outcome} />
                  </Td>
                  <Td>
                    {row.actor ? (
                      <button
                        type="button"
                        className="text-left hover:underline"
                        title="Filter by this actor"
                        onClick={() => setActorId({ id: row.actor!.id, name: row.actor!.name })}
                      >
                        <span className="block">{row.actor.name}</span>
                        <Mono>{row.actor.email}</Mono>
                      </button>
                    ) : (
                      <span className="text-muted-foreground">
                        {row.actorId ? "Deleted account" : "System / anonymous"}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {row.targetType ? (
                      <>
                        <span className="block text-xs text-muted-foreground">
                          {row.targetType}
                        </span>
                        <Mono>{row.targetId}</Mono>
                      </>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    <Mono>{row.ipAddress ?? "—"}</Mono>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : null}
        {list.items.length > 0 ? (
          <LoadMore
            shown={list.items.length}
            total={null}
            hasMore={list.hasMore}
            loading={list.loading}
            onMore={list.loadMore}
          />
        ) : null}
      </Panel>
    </>
  );
}
