"use client";

import { useState } from "react";
import { Confirm } from "@/components/admin/Confirm";
import {
  Empty,
  ErrorNote,
  LoadMore,
  LoadingRows,
  Mono,
  PageTitle,
  Panel,
  Pill,
  Table,
  Td,
  Th,
  buttonClass,
  controlClass,
  dangerButtonClass,
  fmtDate,
  primaryButtonClass,
  titleCase,
} from "@/components/admin/kit";
import type { RoleRow, UserRow } from "@/components/admin/types";
import { useApi, useDebounced, usePaged, withParams } from "@/components/admin/useApi";
import { authRequest } from "@/components/auth/AuthProvider";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ROLES } from "@/lib/auth/rbac/catalog";

export function UsersPanel({
  initial,
}: {
  initial: {
    group?: string | undefined;
    status?: string | undefined;
    activity?: string | undefined;
    role?: string | undefined;
  };
}) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState(
    ROLES.some((r) => r === initial.role) ? (initial.role ?? "") : "",
  );
  const [status, setStatus] = useState(
    initial.status === "active" || initial.status === "inactive" ? initial.status : "",
  );
  const [researchersOnly, setResearchersOnly] = useState(initial.group === "researchers");
  const [recentOnly, setRecentOnly] = useState(initial.activity === "active");
  const [selected, setSelected] = useState<string | null>(null);
  const search = useDebounced(q.trim());

  const list = usePaged<"users", UserRow>(
    withParams("/api/admin/users", {
      q: search,
      role,
      status,
      group: researchersOnly ? "researchers" : undefined,
      activity: recentOnly ? "active" : undefined,
      limit: 25,
    }),
    "users",
  );
  const selectedUser = list.items.find((user) => user.id === selected) ?? null;

  return (
    <>
      <PageTitle
        title="Users & researchers"
        description="Accounts and their roles. Researchers are active accounts holding the Researcher or Author role; “active” means signed in within the last 30 days."
      />
      <Panel flush>
        <div className="flex flex-wrap items-center gap-2 border-b border-rule/70 p-3">
          <input
            aria-label="Search users"
            className={`${controlClass} w-56`}
            placeholder="Search name or email…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
          <select
            aria-label="Role"
            className={controlClass}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="">All roles</option>
            {ROLES.map((code) => (
              <option key={code} value={code}>
                {titleCase(code)}
              </option>
            ))}
          </select>
          <select
            aria-label="Account status"
            className={controlClass}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
          </select>
          <label className="flex items-center gap-1.5 text-[0.8125rem]">
            <input
              type="checkbox"
              checked={researchersOnly}
              onChange={(event) => setResearchersOnly(event.target.checked)}
            />
            Researchers only
          </label>
          <label className="flex items-center gap-1.5 text-[0.8125rem]">
            <input
              type="checkbox"
              checked={recentOnly}
              onChange={(event) => setRecentOnly(event.target.checked)}
            />
            Active in last 30 days
          </label>
        </div>

        {list.error ? <ErrorNote error={list.error} onRetry={list.reload} /> : null}
        {list.loading && list.items.length === 0 ? <LoadingRows /> : null}
        {!list.loading && !list.error && list.items.length === 0 ? (
          <Empty>No accounts match these filters.</Empty>
        ) : null}
        {list.items.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Roles</Th>
                <Th>Status</Th>
                <Th>Submissions</Th>
                <Th>Last active</Th>
                <Th>Joined</Th>
                <Th>
                  <span className="sr-only">Manage</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((user) => (
                <tr key={user.id} className="hover:bg-muted/40">
                  <Td>
                    <span className="block font-medium">{user.name}</span>
                    <Mono>{user.email}</Mono>
                  </Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {user.roles.map((code) => (
                        <Pill key={code}>{titleCase(code)}</Pill>
                      ))}
                    </span>
                  </Td>
                  <Td>
                    <Pill tone={user.isActive ? "leaf" : "danger"}>
                      {user.isActive ? "Active" : "Deactivated"}
                    </Pill>
                  </Td>
                  <Td className="tabular-nums text-muted-foreground">{user.submissions}</Td>
                  <Td className="whitespace-nowrap text-muted-foreground">
                    {fmtDate(user.lastActiveAt)}
                  </Td>
                  <Td className="whitespace-nowrap text-muted-foreground">
                    {fmtDate(user.createdAt)}
                  </Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={() => setSelected(user.id)}
                    >
                      {user.access.roles || user.access.status ? "Manage" : "View"}
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

      <Sheet
        open={selectedUser !== null}
        onOpenChange={(open) => (open ? undefined : setSelected(null))}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetTitle className="font-display text-xl">
            {selectedUser?.name ?? "Account"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Account details, roles and status.
          </SheetDescription>
          {selectedUser ? <UserDetail user={selectedUser} onChanged={list.reload} /> : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function UserDetail({ user, onChanged }: { user: UserRow; onChanged: () => void }) {
  // The role catalogue is only requested if the caller may change roles at all.
  const roles = useApi<{ roles: RoleRow[]; assignable: string[] }>(
    user.access.roles ? "/api/admin/roles" : null,
  );
  const [grant, setGrant] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(task: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await task();
      setGrant("");
      onChanged();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const grantable = (roles.data?.assignable ?? []).filter((code) => !user.roles.includes(code));
  const revocable = new Set(roles.data?.assignable ?? []);

  return (
    <div className="mt-4 space-y-5 text-[0.8125rem]">
      <div>
        <Mono>{user.email}</Mono>
        <p className="mt-1 text-xs text-muted-foreground">
          Joined {fmtDate(user.createdAt)} · Last active {fmtDate(user.lastActiveAt)} ·{" "}
          {user.submissions} submission{user.submissions === 1 ? "" : "s"}
        </p>
      </div>

      <section>
        <h3 className="eyebrow mb-2">Roles</h3>
        <ul className="flex flex-wrap gap-1.5">
          {user.roles.map((code) => (
            <li key={code} className="flex items-center gap-1">
              <Pill>{titleCase(code)}</Pill>
              {user.access.roles && revocable.has(code) ? (
                <Confirm
                  trigger={
                    <button
                      type="button"
                      className="text-xs text-destructive hover:underline"
                      aria-label={`Remove ${titleCase(code)}`}
                      disabled={busy}
                    >
                      remove
                    </button>
                  }
                  title={`Remove ${titleCase(code)}?`}
                  description={`${user.name} will lose this role's permissions and be signed out of all sessions.`}
                  confirmLabel="Remove role"
                  onConfirm={() =>
                    void act(() =>
                      authRequest(`/api/admin/users/${user.id}/roles/${code}`, undefined, "DELETE"),
                    )
                  }
                />
              ) : null}
            </li>
          ))}
        </ul>
        {user.access.roles ? (
          <div className="mt-3 flex gap-2">
            <select
              aria-label="Role to grant"
              className={`${controlClass} min-w-0 flex-1`}
              value={grant}
              onChange={(event) => setGrant(event.target.value)}
              disabled={roles.loading}
            >
              <option value="">Grant a role…</option>
              {grantable.map((code) => (
                <option key={code} value={code}>
                  {titleCase(code)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={primaryButtonClass}
              disabled={!grant || busy}
              onClick={() =>
                void act(() => authRequest(`/api/admin/users/${user.id}/roles`, { role: grant }))
              }
            >
              Grant
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            You cannot change this account&apos;s roles.
          </p>
        )}
      </section>

      <section>
        <h3 className="eyebrow mb-2">Account</h3>
        <div className="flex items-center justify-between gap-3">
          <Pill tone={user.isActive ? "leaf" : "danger"}>
            {user.isActive ? "Active" : "Deactivated"}
          </Pill>
          {user.access.status ? (
            <Confirm
              trigger={
                <button
                  type="button"
                  className={user.isActive ? dangerButtonClass : buttonClass}
                  disabled={busy}
                >
                  {user.isActive ? "Deactivate…" : "Reactivate"}
                </button>
              }
              title={user.isActive ? "Deactivate this account?" : "Reactivate this account?"}
              description={
                user.isActive
                  ? "The person is signed out everywhere and cannot sign in until reactivated."
                  : "The person will be able to sign in again."
              }
              confirmLabel={user.isActive ? "Deactivate" : "Reactivate"}
              onConfirm={() =>
                void act(() =>
                  authRequest(`/api/admin/users/${user.id}`, { isActive: !user.isActive }, "PATCH"),
                )
              }
            />
          ) : (
            <span className="text-xs text-muted-foreground">Status is not yours to change.</span>
          )}
        </div>
      </section>

      {roles.error ? <p className="text-xs text-destructive">{roles.error.message}</p> : null}
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/35 bg-destructive/8 px-3 py-2 text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
