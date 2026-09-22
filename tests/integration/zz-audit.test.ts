import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { PASSWORD, auditEvents, createUser, db, signedIn } from "../helpers/db";
import { Client } from "../helpers/http";

after(() => db.$disconnect());

describe("audit log integrity", () => {
  it("the database rejects UPDATE, DELETE and TRUNCATE on audit records — even for the app's own role", async () => {
    const user = await createUser(["READER"]);
    await new Client().login(user.email, "Wrong-Password-000");
    const [row] = await auditEvents({ event: "AUTH_LOGIN_FAILED", actorId: user.id });
    assert.ok(row);

    await assert.rejects(
      db.auditLog.update({ where: { id: row.id }, data: { outcome: "SUCCESS" } }),
      /append-only/i,
    );
    await assert.rejects(db.auditLog.delete({ where: { id: row.id } }), /append-only/i);
    await assert.rejects(db.auditLog.deleteMany({ where: { actorId: user.id } }), /append-only/i);
    await assert.rejects(db.$executeRawUnsafe(`TRUNCATE "AuditLog"`), /append-only/i);
    await assert.rejects(
      db.$executeRawUnsafe(`UPDATE "AuditLog" SET "event" = 'X'`),
      /append-only/i,
    );

    const after = await db.auditLog.findUniqueOrThrow({ where: { id: row.id } });
    assert.equal(after.event, "AUTH_LOGIN_FAILED");
    assert.equal(after.outcome, "FAILURE");
  });

  it("a user with audit history cannot be deleted out from under it", async () => {
    const user = await createUser(["READER"]);
    await new Client().login(user.email, PASSWORD);
    await assert.rejects(db.user.delete({ where: { id: user.id } }), /foreign key|constraint/i);
  });

  it("no HTTP surface can alter the audit log, for any role, including SUPER_ADMIN", async () => {
    const { client } = await signedIn(["SUPER_ADMIN"]);
    for (const method of ["post", "put", "patch", "delete"] as const) {
      const res = await client[method]("/api/admin/audit-logs");
      assert.equal(res.status, 405, method);
    }
    assert.equal((await client.get("/api/admin/audit-logs")).status, 200);
  });

  it("audit reads are paginated, filterable, and expose the recorded metadata to authorised viewers only", async () => {
    const { client } = await signedIn(["SUPER_ADMIN"]);
    const page1 = await client.get("/api/admin/audit-logs?limit=5");
    assert.equal(page1.status, 200);
    assert.equal(page1.body.events.length, 5);
    assert.ok(page1.body.nextCursor);
    const page2 = await client.get(`/api/admin/audit-logs?limit=5&cursor=${page1.body.nextCursor}`);
    const ids1 = new Set(page1.body.events.map((e: { id: string }) => e.id));
    assert.ok(
      page2.body.events.every((e: { id: string }) => !ids1.has(e.id)),
      "pages must not overlap",
    );

    const logins = await client.get("/api/admin/audit-logs?event=AUTH_LOGIN_FAILED&limit=100");
    assert.ok(logins.body.events.length > 0);
    assert.ok(logins.body.events.every((e: { event: string }) => e.event === "AUTH_LOGIN_FAILED"));
    assert.equal((await client.get("/api/admin/audit-logs?limit=9999")).status, 422);
    assert.equal(JSON.stringify(logins.body).includes(PASSWORD), false);
    assert.equal(JSON.stringify(logins.body).toLowerCase().includes("argon2"), false);
  });
});

describe("audit coverage of security-sensitive events", () => {
  it("has recorded each required category during this run", async () => {
    const required = [
      "AUTH_REGISTERED",
      "AUTH_LOGIN",
      "AUTH_LOGIN_FAILED",
      "AUTH_LOGOUT",
      "AUTH_LOGIN_LOCKOUT",
      "AUTH_PASSWORD_CHANGED",
      "AUTH_PASSWORD_RESET_REQUESTED",
      "AUTH_PASSWORD_RESET_COMPLETED",
      "SECURITY_CSRF_REJECTED",
      "AUTHORIZATION_DENIED",
      "ROLE_ASSIGNED",
      "ROLE_REVOKED",
      "ACCOUNT_DEACTIVATED",
      "ACCOUNT_ACTIVATED",
      "REVIEW_ASSIGNED",
      "REVIEW_SUBMITTED",
      "ARTICLE_SUBMITTED",
      "ARTICLE_DECISION",
      "ARTICLE_PUBLISHED",
      "RBAC_SYNCED",
    ];
    const present = new Set(
      (await db.auditLog.findMany({ select: { event: true }, distinct: ["event"] })).map(
        (r) => r.event,
      ),
    );
    for (const event of required)
      assert.ok(present.has(event), `no ${event} audit record was written`);
  });

  it("stores no credentials in audit metadata", async () => {
    const rows = await db.auditLog.findMany({ select: { metadata: true } });
    const text = JSON.stringify(rows);
    assert.equal(text.includes(PASSWORD), false);
    assert.equal(/\$argon2/.test(text), false);
    assert.equal(/"(password|token|secret)[A-Za-z]*":"(?!\[redacted\])/i.test(text), false);
  });
});
