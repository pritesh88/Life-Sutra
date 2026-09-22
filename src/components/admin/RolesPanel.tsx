"use client";

import {
  Empty,
  ErrorNote,
  LoadingRows,
  Mono,
  PageTitle,
  Panel,
  Pill,
  Table,
  Td,
  Th,
  titleCase,
} from "@/components/admin/kit";
import type { RoleRow } from "@/components/admin/types";
import { useApi } from "@/components/admin/useApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERMISSION_DESCRIPTIONS, ROLES } from "@/lib/auth/rbac/catalog";

/**
 * Read-only view of the live Role → Permission tables. Grants are defined in
 * code (src/lib/auth/rbac/catalog.ts) and mirrored to the database by
 * `npm run db:seed`; roles are assigned to people from Users & researchers.
 */
export function RolesPanel() {
  const { data, error, loading, reload } = useApi<{ roles: RoleRow[]; assignable: string[] }>(
    "/api/admin/roles",
  );
  // Order roles by seniority (catalog order) purely for display.
  const roles = [...(data?.roles ?? [])].sort(
    (a, b) =>
      ROLES.indexOf(a.code as (typeof ROLES)[number]) -
      ROLES.indexOf(b.code as (typeof ROLES)[number]),
  );
  const permissions = [...new Set(roles.flatMap((role) => role.permissions))].sort();
  const describe = (key: string) => (PERMISSION_DESCRIPTIONS as Record<string, string>)[key] ?? "";

  return (
    <>
      <PageTitle
        title="Roles & permissions"
        description="Which permissions each role grants, straight from the authorization tables. Access is always decided from these grants on the server — never from a role's name."
      />
      {error ? <ErrorNote error={error} onRetry={reload} /> : null}
      {loading && !data ? <LoadingRows rows={8} /> : null}
      {data ? (
        <Tabs defaultValue="roles">
          <TabsList className="mb-3">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="matrix">Permission matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <Panel flush>
              {roles.length === 0 ? (
                <Empty>No roles are defined. Run the RBAC seed.</Empty>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Role</Th>
                      <Th>Accounts</Th>
                      <Th>Permissions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.code} className="align-top">
                        <Td className="w-72">
                          <span className="block font-medium">{titleCase(role.code)}</span>
                          <span className="block text-xs text-muted-foreground">
                            {role.description}
                          </span>
                          <Mono>{role.code}</Mono>
                        </Td>
                        <Td className="tabular-nums">{role.userCount}</Td>
                        <Td>
                          <span className="flex flex-wrap gap-1">
                            {role.permissions.map((key) => (
                              <span key={key} title={describe(key)}>
                                <Pill>{key}</Pill>
                              </span>
                            ))}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Panel>
            {data.assignable.length > 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                You can grant or revoke {data.assignable.length} of {roles.length} roles (those
                whose permissions you hold in full).
              </p>
            ) : null}
          </TabsContent>

          <TabsContent value="matrix">
            <Panel flush>
              <Table className="min-w-[56rem]">
                <thead>
                  <tr>
                    <Th className="sticky left-0 z-10 bg-card">Permission</Th>
                    {roles.map((role) => (
                      <Th key={role.code} className="text-center">
                        <span className="inline-block max-w-[5.5rem] leading-tight whitespace-normal">
                          {titleCase(role.code)}
                        </span>
                      </Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((key) => (
                    <tr key={key} className="hover:bg-muted/40">
                      <Td className="sticky left-0 bg-card">
                        <Mono className="text-foreground">{key}</Mono>
                        <span className="block text-[0.7rem] text-muted-foreground">
                          {describe(key)}
                        </span>
                      </Td>
                      {roles.map((role) => (
                        <Td key={role.code} className="text-center">
                          {role.permissions.includes(key) ? (
                            <span
                              className="inline-block size-2 rounded-full bg-leaf"
                              role="img"
                              aria-label={`${titleCase(role.code)} holds ${key}`}
                            />
                          ) : (
                            <span className="text-rule" aria-hidden="true">
                              ·
                            </span>
                          )}
                        </Td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Panel>
          </TabsContent>
        </Tabs>
      ) : null}
    </>
  );
}
