import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { HttpError } from "../../src/lib/api/errors";
import { assignRole, revokeRole, setAccountActive } from "../../src/lib/admin/users";
import {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  splitPermission,
} from "../../src/lib/auth/rbac/catalog";
import { syncRbac } from "../../src/lib/auth/rbac/sync";
import { PASSWORD, auditEvents, createUser, db, signedIn } from "../helpers/db";
import { BASE_URL, Client, SESSION_COOKIE } from "../helpers/http";

after(() => db.$disconnect());

const clientInfo = { ipAddress: "127.0.0.1", userAgent: "test" };

describe("RBAC data model", () => {
  it("database roles/permissions/grants exactly mirror the catalog (no drift)", async () => {
    const roles = await db.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
    assert.deepEqual(roles.map((r) => r.code).sort(), [...ROLES].sort());
    for (const role of roles) {
      const actual = role.permissions
        .map(({ permission }) => `${permission.resource}:${permission.action}`)
        .sort();
      const expected = [...ROLE_PERMISSIONS[role.code as (typeof ROLES)[number]]].sort();
      assert.deepEqual(actual, expected, `${role.code} grants drifted from the catalog`);
    }
    const permissions = await db.permission.findMany();
    assert.deepEqual(
      permissions.map((p) => `${p.resource}:${p.action}`).sort(),
      [...PERMISSIONS].sort(),
    );
  });

  it("syncing is idempotent and removes grants that are no longer in the catalog", async () => {
    const support = await db.role.findUniqueOrThrow({ where: { code: "SUPPORT_ADMIN" } });
    const stray = await db.permission.findUniqueOrThrow({
      where: { resource_action: splitPermission("audit:view") },
    });
    await db.rolePermission.create({ data: { roleId: support.id, permissionId: stray.id } });

    const first = await syncRbac(db);
    assert.equal(first.grantsRemoved, 1, "the stray grant should have been revoked");
    assert.equal((await syncRbac(db)).changed, false, "second run must be a no-op");
    assert.equal(
      await db.rolePermission.count({ where: { roleId: support.id, permissionId: stray.id } }),
      0,
    );
    assert.ok(
      (await auditEvents({ event: "RBAC_SYNCED" })).length >= 2,
      "role/permission changes are audited",
    );
  });
});

describe("protected API routes: authentication", () => {
  const endpoints: [string, string][] = [
    ["GET", "/api/admin/audit-logs"],
    ["GET", "/api/admin/users"],
    ["GET", "/api/admin/roles"],
    ["POST", "/api/admin/users/x/roles"],
    ["DELETE", "/api/admin/users/x/roles/EDITOR"],
    ["PATCH", "/api/admin/users/x"],
    ["GET", "/api/articles"],
    ["POST", "/api/articles"],
    ["GET", "/api/articles/x"],
    ["GET", "/api/editor/articles"],
    ["GET", "/api/editor/reviewers"],
    ["POST", "/api/editor/articles/x/assignments"],
    ["GET", "/api/reviews"],
    ["GET", "/api/reviews/x"],
    ["POST", "/api/auth/password/change"],
    ["POST", "/api/auth/sessions/revoke-others"],
  ];

  it("returns 401 to anonymous callers on every protected endpoint (direct access)", async () => {
    for (const [method, path] of endpoints) {
      const res = await new Client()
        .raw(path, {
          method,
          headers: { "content-type": "application/json" },
          ...(method === "GET" || method === "DELETE" ? {} : { body: "{}" }),
        })
        .catch((error) => {
          throw new Error(`${method} ${path}: ${error}`);
        });
      assert.equal(res.status, 401, `${method} ${path}`);
    }
  });

  it("does not trust identity headers or a forged cookie", async () => {
    const client = new Client();
    const forged = await client.get("/api/admin/audit-logs", {
      "x-user-id": "anything",
      "x-user-role": "SUPER_ADMIN",
      authorization: "Bearer SUPER_ADMIN",
    });
    assert.equal(forged.status, 401);
    client.setCookie(SESSION_COOKIE, "A".repeat(43));
    assert.equal((await client.get("/api/admin/audit-logs")).status, 401);
    client.setCookie(SESSION_COOKIE, JSON.stringify({ role: "SUPER_ADMIN" }));
    assert.equal((await client.get("/api/admin/users")).status, 401);
  });

  it("gates signed-in-only pages at the edge and the server", async () => {
    const anonymous = await new Client().raw("/profile");
    assert.equal(anonymous.status, 307);
    assert.match(anonymous.headers.get("location") ?? "", /\/auth\/login\?next=%2Fprofile/);
  });

  it("returns no-store and security headers", async () => {
    const res = await new Client().get("/api/admin/users");
    assert.equal(res.headers.get("cache-control"), "no-store");
    const home = await new Client().raw("/");
    assert.equal(home.headers.get("x-content-type-options"), "nosniff");
    assert.equal(home.headers.get("x-frame-options"), "DENY");
    assert.match(home.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
    assert.match(home.headers.get("strict-transport-security") ?? "", /max-age=/);
    assert.equal(home.headers.get("x-powered-by"), null);
  });
});

describe("protected API routes: authorization (403)", () => {
  it("denies callers who lack the permission — and audits the denial", async () => {
    const { user, client } = await signedIn(["READER"]);
    for (const path of [
      "/api/admin/audit-logs",
      "/api/admin/users",
      "/api/admin/roles",
      "/api/editor/articles",
      "/api/editor/reviewers",
      "/api/reviews",
    ]) {
      const res = await client.get(path);
      assert.equal(res.status, 403, path);
      assert.equal(res.body.error, "You do not have permission to perform this action.");
    }
    const denied = await auditEvents({ event: "AUTHORIZATION_DENIED", actorId: user.id });
    assert.ok(denied.length >= 6);
    assert.equal(denied[0]!.outcome, "DENIED");
  });

  it("applies each role's own permission set (matrix)", async () => {
    const expectations: [string, (typeof ROLES)[number], number][] = [
      ["/api/admin/audit-logs", "SUPER_ADMIN", 200],
      ["/api/admin/audit-logs", "JOURNAL_ADMIN", 200],
      ["/api/admin/audit-logs", "EDITOR", 403],
      ["/api/admin/audit-logs", "SUPPORT_ADMIN", 403],
      ["/api/admin/audit-logs", "REVIEWER", 403],
      ["/api/admin/audit-logs", "AUTHOR", 403],
      ["/api/admin/users", "SUPPORT_ADMIN", 200],
      ["/api/admin/users", "JOURNAL_ADMIN", 200],
      ["/api/admin/users", "EDITOR", 403],
      ["/api/admin/roles", "SUPER_ADMIN", 200],
      ["/api/admin/roles", "SUPPORT_ADMIN", 200],
      ["/api/admin/roles", "AUTHOR", 403],
      ["/api/editor/articles", "EDITOR", 200],
      ["/api/editor/articles", "REVIEWER_MANAGER", 200],
      ["/api/editor/articles", "REVIEWER", 403],
      ["/api/editor/articles", "AUTHOR", 403],
      ["/api/editor/reviewers", "REVIEWER_MANAGER", 200],
      ["/api/editor/reviewers", "EDITOR", 200],
      ["/api/editor/reviewers", "CONTENT_EDITOR", 403],
      ["/api/reviews", "REVIEWER", 200],
      ["/api/reviews", "EDITOR", 403],
      ["/api/articles", "AUTHOR", 200],
      ["/api/articles", "RESEARCHER", 200],
      ["/api/articles", "READER", 403],
      ["/api/articles", "INSTITUTION_MEMBER", 403],
      ["/api/articles", "REVIEWER", 403],
    ];
    const sessions = new Map<string, Client>();
    for (const [path, role, expected] of expectations) {
      let client = sessions.get(role);
      if (!client) {
        client = (await signedIn([role])).client;
        sessions.set(role, client);
      }
      assert.equal((await client.get(path)).status, expected, `${role} ${path}`);
    }
  });

  it("never exposes the audit log's writes: no POST/PUT/PATCH/DELETE handler exists", async () => {
    const { client } = await signedIn(["SUPER_ADMIN"]);
    for (const method of ["POST", "PUT", "PATCH", "DELETE"] as const) {
      const res = await client[method.toLowerCase() as "post"]("/api/admin/audit-logs", {});
      assert.equal(res.status, 405, method);
    }
  });
});

describe("role management and privilege escalation", () => {
  it("lets a SUPER_ADMIN grant and revoke a role, with immediate effect on the target's permissions", async () => {
    const admin = await signedIn(["SUPER_ADMIN"]);
    const target = await signedIn(["READER"]);
    assert.equal((await target.client.get("/api/editor/articles")).status, 403);

    const grant = await admin.client.post(`/api/admin/users/${target.user.id}/roles`, {
      role: "EDITOR",
    });
    assert.equal(grant.status, 201);
    assert.deepEqual(grant.body.user.roles, ["EDITOR", "READER"]);

    // Role changes revoke the target's sessions, so they must sign in again…
    assert.equal((await target.client.get("/api/editor/articles")).status, 401);
    // …and the new role is effective immediately on that fresh login.
    const again = new Client();
    assert.equal((await again.login(target.user.email, PASSWORD)).status, 200);
    assert.equal((await again.get("/api/editor/articles")).status, 200);

    const revoke = await admin.client.delete(`/api/admin/users/${target.user.id}/roles/EDITOR`);
    assert.equal(revoke.status, 200);
    assert.deepEqual(revoke.body.user.roles, ["READER"]);
    assert.equal(
      (await again.get("/api/editor/articles")).status,
      401,
      "revocation logs the target out",
    );
    const third = new Client();
    await third.login(target.user.email, PASSWORD);
    assert.equal(
      (await third.get("/api/editor/articles")).status,
      403,
      "and the permission is gone",
    );

    const assigned = await auditEvents({ event: "ROLE_ASSIGNED", targetId: target.user.id });
    const revoked = await auditEvents({ event: "ROLE_REVOKED", targetId: target.user.id });
    assert.equal(assigned.length, 1);
    assert.equal(revoked.length, 1);
    assert.equal(assigned[0]!.actorId, admin.user.id);
    assert.equal((assigned[0]!.metadata as Record<string, unknown>)["role"], "EDITOR");
  });

  it("blocks ordinary users from every role/account endpoint (self-escalation attempts)", async () => {
    const { user, client } = await signedIn(["AUTHOR"]);
    const own = await client.post(`/api/admin/users/${user.id}/roles`, { role: "SUPER_ADMIN" });
    assert.equal(own.status, 403);
    assert.equal(
      (await client.patch(`/api/admin/users/${user.id}`, { isActive: true })).status,
      403,
    );
    assert.equal((await client.delete(`/api/admin/users/${user.id}/roles/AUTHOR`)).status, 403);
    const me = await client.get("/api/auth/session");
    assert.deepEqual(me.body.user.roles, ["AUTHOR"]);
    assert.equal(await db.userRole.count({ where: { userId: user.id } }), 1);
  });

  it("stops a role:manage holder from granting themselves or others more than they hold", async () => {
    // A custom actor: SUPPORT_ADMIN + an extra role:manage grant, as a future config change might create.
    const support = await db.role.findUniqueOrThrow({ where: { code: "SUPPORT_ADMIN" } });
    const roleManage = await db.permission.findUniqueOrThrow({
      where: { resource_action: splitPermission("role:manage") },
    });
    const actor = await signedIn(["SUPPORT_ADMIN"]);
    await db.rolePermission.create({ data: { roleId: support.id, permissionId: roleManage.id } });
    try {
      const victim = await createUser(["READER"]);
      // Cannot mint a SUPER_ADMIN (permissions not a subset of the actor's)…
      assert.equal(
        (await actor.client.post(`/api/admin/users/${victim.id}/roles`, { role: "SUPER_ADMIN" }))
          .status,
        403,
      );
      // …nor an EDITOR (actor lacks editorial permissions)…
      assert.equal(
        (await actor.client.post(`/api/admin/users/${victim.id}/roles`, { role: "EDITOR" })).status,
        403,
      );
      // …but may hand out roles within its own means.
      assert.equal(
        (
          await actor.client.post(`/api/admin/users/${victim.id}/roles`, {
            role: "INSTITUTION_MEMBER",
          })
        ).status,
        201,
      );
      // Nor can it modify someone who outranks it.
      const superAdmin = await createUser(["SUPER_ADMIN"]);
      assert.equal(
        (await actor.client.post(`/api/admin/users/${superAdmin.id}/roles`, { role: "READER" }))
          .status,
        403,
      );
      assert.equal(
        (await actor.client.delete(`/api/admin/users/${superAdmin.id}/roles/SUPER_ADMIN`)).status,
        403,
      );
      assert.equal(
        (await actor.client.patch(`/api/admin/users/${superAdmin.id}`, { isActive: false })).status,
        403,
      );
      // Nor change its own roles.
      assert.equal(
        (await actor.client.post(`/api/admin/users/${actor.user.id}/roles`, { role: "READER" }))
          .status,
        403,
      );
    } finally {
      await db.rolePermission.delete({
        where: { roleId_permissionId: { roleId: support.id, permissionId: roleManage.id } },
      });
    }
  });

  it("validates role names, duplicate grants and unknown users", async () => {
    const admin = await signedIn(["SUPER_ADMIN"]);
    const target = await createUser(["READER"]);
    assert.equal(
      (await admin.client.post(`/api/admin/users/${target.id}/roles`, { role: "GOD_MODE" })).status,
      422,
    );
    assert.equal(
      (await admin.client.post(`/api/admin/users/${target.id}/roles`, { role: "READER" })).status,
      409,
    );
    assert.equal(
      (await admin.client.delete(`/api/admin/users/${target.id}/roles/EDITOR`)).status,
      409,
    );
    assert.equal(
      (await admin.client.post(`/api/admin/users/does-not-exist/roles`, { role: "READER" })).status,
      404,
    );
    assert.equal(
      (await admin.client.post(`/api/admin/users/${admin.user.id}/roles`, { role: "READER" }))
        .status,
      403,
      "no self-service role changes",
    );
  });

  it("deactivating an account revokes its sessions and blocks login; reactivation restores it", async () => {
    const support = await signedIn(["SUPPORT_ADMIN"]);
    const target = await signedIn(["READER"]);
    const res = await support.client.patch(`/api/admin/users/${target.user.id}`, {
      isActive: false,
    });
    assert.equal(res.status, 200);
    assert.equal((await target.client.get("/api/auth/session")).body.user, null);
    assert.equal((await new Client().login(target.user.email, PASSWORD)).status, 401);

    assert.equal(
      (await support.client.patch(`/api/admin/users/${target.user.id}`, { isActive: true })).status,
      200,
    );
    assert.equal((await new Client().login(target.user.email, PASSWORD)).status, 200);
    assert.equal(
      (await auditEvents({ event: "ACCOUNT_DEACTIVATED", targetId: target.user.id })).length,
      1,
    );
    assert.equal(
      (await auditEvents({ event: "ACCOUNT_ACTIVATED", targetId: target.user.id })).length,
      1,
    );

    const editor = await createUser(["EDITOR"]);
    assert.equal(
      (await support.client.patch(`/api/admin/users/${editor.id}`, { isActive: false })).status,
      403,
      "cannot disable someone who outranks you",
    );
    assert.equal(
      (await support.client.patch(`/api/admin/users/${support.user.id}`, { isActive: false }))
        .status,
      403,
      "cannot disable yourself",
    );
  });

  it("never demotes or deactivates the last active SUPER_ADMIN", async () => {
    // Only reachable by an actor holding every permission; exercise the service directly.
    const everything = {
      id: "not-a-real-user",
      email: "x",
      name: "x",
      roles: [],
      permissions: [...PERMISSIONS],
    };
    const others = await db.user.findMany({
      where: { isActive: true, roles: { some: { role: { code: "SUPER_ADMIN" } } } },
      select: { id: true },
    });
    const keep = await createUser(["SUPER_ADMIN"]);
    const toPark = others.filter((u) => u.id !== keep.id);
    await db.user.updateMany({
      where: { id: { in: toPark.map((u) => u.id) } },
      data: { isActive: false },
    });
    try {
      await assert.rejects(
        setAccountActive(everything, keep.id, false, clientInfo),
        (e: unknown) => e instanceof HttpError && e.status === 409,
      );
      await assert.rejects(
        revokeRole(everything, keep.id, "SUPER_ADMIN", clientInfo),
        (e: unknown) => e instanceof HttpError && e.status === 409,
      );
      assert.equal((await db.user.findUniqueOrThrow({ where: { id: keep.id } })).isActive, true);
    } finally {
      await db.user.updateMany({
        where: { id: { in: toPark.map((u) => u.id) } },
        data: { isActive: true },
      });
    }
  });
});

describe("CSRF and cross-site protection", () => {
  it("rejects state-changing requests without a matching CSRF token", async () => {
    const admin = await signedIn(["SUPER_ADMIN"]);
    const target = await createUser(["READER"]);
    const path = `/api/admin/users/${target.id}/roles`;
    const json = { "content-type": "application/json" };

    const none = await admin.client.raw(path, {
      method: "POST",
      headers: json,
      body: JSON.stringify({ role: "EDITOR" }),
    });
    assert.equal(none.status, 403);

    const mismatch = await admin.client.raw(path, {
      method: "POST",
      headers: { ...json, "x-csrf-token": "A".repeat(43) },
      body: JSON.stringify({ role: "EDITOR" }),
    });
    assert.equal(mismatch.status, 403);

    // A token planted by another origin (matching cookie + header, but not the session's) is worthless.
    const planted = "B".repeat(43);
    admin.client.setCookie("__Host-life_sutra_csrf", planted);
    const forged = await admin.client.raw(path, {
      method: "POST",
      headers: { ...json, "x-csrf-token": planted },
      body: JSON.stringify({ role: "EDITOR" }),
    });
    assert.equal(forged.status, 403);

    assert.equal(
      await db.userRole.count({ where: { userId: target.id } }),
      1,
      "nothing was granted",
    );
  });

  it("rejects cross-site browser requests via Origin / Sec-Fetch-Site even with a valid token", async () => {
    const { client } = await signedIn(["AUTHOR"]);
    const body = { title: "A perfectly reasonable title", abstract: "x".repeat(80) };
    const cross = await client.post("/api/articles", body, { origin: "https://evil.example" });
    assert.equal(cross.status, 403);
    const fetchMeta = await client.post("/api/articles", body, { "sec-fetch-site": "cross-site" });
    assert.equal(fetchMeta.status, 403);
    assert.equal((await client.get("/api/articles")).body.articles.length, 0);
    const sameOrigin = await client.post("/api/articles", body, {
      "sec-fetch-site": "same-origin",
    });
    assert.equal(sameOrigin.status, 201);
  });

  it("rejects non-JSON content types on mutations (blocks form-post CSRF)", async () => {
    const { client } = await signedIn(["AUTHOR"]);
    const token = await client.csrf();
    const res = await client.raw("/api/articles", {
      method: "POST",
      headers: { "content-type": "text/plain", "x-csrf-token": token },
      body: JSON.stringify({ title: "A perfectly reasonable title", abstract: "x".repeat(80) }),
    });
    assert.equal(res.status, 415);
  });

  it("accepts a same-origin Origin header, and refuses oversized bodies before buffering them", async () => {
    const { client } = await signedIn(["AUTHOR"]);
    const body = { title: "A perfectly reasonable title", abstract: "x".repeat(80) };
    assert.equal((await client.post("/api/articles", body, { origin: BASE_URL })).status, 201);
    const huge = await client.post("/api/articles", { ...body, abstract: "x".repeat(70_000) });
    assert.equal(huge.status, 413);
  });
});

describe("brute-force and abuse protection", () => {
  it("throttles repeated failed logins per client+account, but not the account's real owner elsewhere", async () => {
    const user = await createUser(["READER"]);
    const attacker = new Client();
    const statuses: number[] = [];
    for (let i = 0; i < 7; i += 1)
      statuses.push((await attacker.login(user.email, `Wrong-Guess-${i}-xyz`)).status);
    assert.deepEqual(statuses.slice(0, 5), [401, 401, 401, 401, 401]);
    assert.deepEqual(statuses.slice(5), [429, 429]);

    // Even the correct password is refused for that client while locked out…
    const locked = await attacker.login(user.email, PASSWORD);
    assert.equal(locked.status, 429);
    assert.ok(Number(locked.headers.get("retry-after")) > 0);
    assert.equal(locked.body.error, "Too many attempts. Please try again later.");
    // …but the real owner from another address still gets in.
    assert.equal((await new Client().login(user.email, PASSWORD)).status, 200);

    assert.ok((await auditEvents({ event: "AUTH_LOGIN_LOCKOUT", actorId: user.id })).length >= 1);
  });

  it("caps distributed guessing against one account across many IPs", async () => {
    const user = await createUser(["READER"]);
    let blockedAt = -1;
    for (let i = 0; i < 24; i += 1) {
      const res = await new Client().login(user.email, `Wrong-Guess-${i}-abc`);
      if (res.status === 429) {
        blockedAt = i;
        break;
      }
    }
    assert.equal(blockedAt, 20, "the 21st failure across all IPs should trip the per-account cap");
    // Even the owner is blocked for the remainder of the window — the documented trade-off of a per-account cap.
    assert.equal((await new Client().login(user.email, PASSWORD)).status, 429);
  });

  it("throttles registration per IP", async () => {
    const client = new Client();
    const statuses: number[] = [];
    for (let i = 0; i < 12; i += 1) {
      statuses.push(
        (
          await client.post("/api/auth/register", {
            name: "Spam Bot",
            email: `spam${i}.${Date.now()}@example.test`,
            password: PASSWORD,
          })
        ).status,
      );
    }
    assert.equal(statuses.filter((s) => s === 201).length, 10);
    assert.equal(statuses.filter((s) => s === 429).length, 2);
  });

  it("throttles password-reset requests without revealing which emails exist", async () => {
    const user = await createUser(["READER"]);
    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1)
      statuses.push(
        (await new Client().post("/api/auth/password/forgot", { email: user.email })).status,
      );
    assert.deepEqual(statuses, [202, 202, 202, 202, 202], "per-email throttling is silent");
    assert.equal(
      await db.passwordResetToken.count({ where: { userId: user.id } }),
      3,
      "…but only 3 links were actually issued",
    );
  });

  it("does not store raw emails or IPs in rate-limit keys", async () => {
    const rows = await db.rateLimit.findMany();
    assert.ok(rows.length > 0);
    for (const row of rows) assert.match(row.key, /^[a-z:-]+:[0-9a-f]{32}$/);
  });
});
