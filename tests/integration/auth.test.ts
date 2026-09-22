import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { tokenHash } from "../../src/lib/auth/crypto";
import {
  PASSWORD,
  auditEvents,
  createUser,
  db,
  resetTokenFor,
  serverLogLength,
  signedIn,
  uniqueEmail,
} from "../helpers/db";
import { CSRF_COOKIE, Client, SESSION_COOKIE } from "../helpers/http";

after(() => db.$disconnect());

const register = (client: Client, overrides: Record<string, unknown> = {}) =>
  client.post("/api/auth/register", {
    name: "Ananya Sharma",
    email: uniqueEmail("reg"),
    password: PASSWORD,
    ...overrides,
  });

describe("registration", () => {
  it("creates an account, signs the user in and sets hardened cookies", async () => {
    const client = new Client();
    const email = uniqueEmail("ok");
    const res = await register(client, { email });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, email);

    const session = res.setCookies.get(SESSION_COOKIE);
    assert.ok(session, "session cookie missing");
    assert.equal(session.httpOnly, true, "session cookie must be HttpOnly");
    assert.equal(session.secure, true, "session cookie must be Secure");
    assert.equal(session.sameSite, "lax");
    assert.equal(session.path, "/");
    assert.equal(session.domain, undefined, "__Host- cookies must not set Domain");
    assert.ok(session.value.length >= 40, "token must be high-entropy");

    const csrf = res.setCookies.get(CSRF_COOKIE);
    assert.ok(csrf);
    assert.equal(csrf.httpOnly, false, "double-submit token must be readable by the page");
    assert.equal(csrf.secure, true);
  });

  it("stores an argon2id hash, never the password, and stores only a hash of the session token", async () => {
    const client = new Client();
    const email = uniqueEmail("hash");
    const res = await register(client, { email });
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    assert.match(user.passwordHash, /^\$argon2id\$/);
    assert.ok(!user.passwordHash.includes(PASSWORD));

    const token = res.setCookies.get(SESSION_COOKIE)!.value;
    const stored = await db.session.findMany({ where: { userId: user.id } });
    assert.equal(stored.length, 1);
    assert.notEqual(stored[0]!.tokenHash, token, "raw session token must not be stored");
    assert.equal(stored[0]!.tokenHash, tokenHash(token));
  });

  it("gives self-registered users only the default low-privilege roles", async () => {
    const client = new Client();
    const res = await register(client);
    assert.deepEqual(res.body.user.roles, ["AUTHOR", "READER"]);
    for (const forbidden of [
      "role:manage",
      "user:manage",
      "audit:view",
      "review:assign",
      "article:review",
    ])
      assert.ok(!res.body.user.permissions.includes(forbidden));
  });

  it("ignores client-supplied roles, role ids and user ids (mass-assignment)", async () => {
    const client = new Client();
    const res = await register(client, {
      roles: ["SUPER_ADMIN"],
      role: "SUPER_ADMIN",
      roleId: "x",
      id: "victim-user-id",
      userId: "victim-user-id",
      isActive: false,
      passwordHash: "$argon2id$forged",
    });
    assert.equal(res.status, 201);
    assert.deepEqual(res.body.user.roles, ["AUTHOR", "READER"]);
    assert.notEqual(res.body.user.id, "victim-user-id");
    const user = await db.user.findUniqueOrThrow({ where: { id: res.body.user.id } });
    assert.equal(user.isActive, true);
    assert.ok(!user.passwordHash.includes("forged"));
  });

  it("rejects a duplicate email, case-insensitively, without creating a second account", async () => {
    const email = uniqueEmail("dup");
    assert.equal((await register(new Client(), { email })).status, 201);
    const again = await register(new Client(), { email: email.toUpperCase() });
    assert.equal(again.status, 409);
    assert.equal(await db.user.count({ where: { email } }), 1);
  });

  it("the database itself refuses a non-normalised email", async () => {
    await assert.rejects(
      db.user.create({ data: { email: "Mixed@Example.test", name: "X", passwordHash: "x" } }),
      /User_email_lowercase_check|check constraint/i,
    );
  });

  it("validates input and reports field errors", async () => {
    const cases: [string, Record<string, unknown>, string][] = [
      ["invalid email", { email: "not-an-email" }, "email"],
      ["short password", { password: "Short1" }, "password"],
      ["no digit", { password: "NoDigitsInThisOne" }, "password"],
      ["common password", { password: "password1234" }, "password"],
      ["short name", { name: "A" }, "name"],
      ["oversized password", { password: `${"a1".repeat(100)}` }, "password"],
    ];
    for (const [label, override, field] of cases) {
      const res = await register(new Client(), override);
      assert.equal(res.status, 422, label);
      assert.ok(res.body.fields?.[field], `${label}: expected an error on ${field}`);
    }
    const missing = await new Client().post("/api/auth/register", {});
    assert.equal(missing.status, 422);
    const notJson = await (async () => {
      const client = new Client();
      const token = await client.csrf();
      return client.raw("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": token },
        body: "{not json",
      });
    })();
    assert.equal(notJson.status, 400);
  });

  it("records registration in the audit log", async () => {
    const res = await register(new Client());
    const events = await auditEvents({ actorId: res.body.user.id, event: "AUTH_REGISTERED" });
    assert.equal(events.length, 1);
  });
});

describe("login", () => {
  it("signs in with correct credentials, and returns server-computed roles/permissions", async () => {
    const user = await createUser(["EDITOR"]);
    const client = new Client();
    const res = await client.login(user.email, PASSWORD);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.user.roles, ["EDITOR"]);
    assert.ok(res.body.user.permissions.includes("article:review"));
    assert.ok(!res.body.user.permissions.includes("role:manage"));
    assert.ok(client.cookie(SESSION_COOKIE));
    assert.equal(JSON.stringify(res.body).includes("passwordHash"), false);
  });

  it("gives an identical generic error for wrong password, unknown email and disabled account", async () => {
    const user = await createUser(["READER"]);
    const disabled = await createUser(["READER"], { isActive: false });
    const responses = [
      await new Client().login(user.email, "Wrong-Password-123"),
      await new Client().login(uniqueEmail("ghost"), PASSWORD),
      await new Client().login(disabled.email, PASSWORD),
    ];
    for (const res of responses) {
      assert.equal(res.status, 401);
      assert.equal(res.body.error, "Invalid email or password.");
      assert.equal(res.setCookies.size <= 1, true); // only the csrf cookie may be present
      assert.ok(!res.setCookies.has(SESSION_COOKIE));
    }
    assert.deepEqual(responses[0]!.body, responses[1]!.body);
    assert.deepEqual(responses[1]!.body, responses[2]!.body);
  });

  it("audits successes and failures, and never records the password", async () => {
    const user = await createUser(["READER"]);
    const bad = new Client();
    await bad.login(user.email, "Wrong-Password-123");
    const good = new Client();
    await good.login(user.email, PASSWORD);

    const failed = await auditEvents({ event: "AUTH_LOGIN_FAILED", actorId: user.id });
    const ok = await auditEvents({ event: "AUTH_LOGIN", actorId: user.id });
    assert.equal(failed.length, 1);
    assert.equal(failed[0]!.outcome, "FAILURE");
    assert.equal(ok.length, 1);
    assert.equal(JSON.stringify(failed).includes("Wrong-Password-123"), false);
    assert.equal(JSON.stringify(failed).includes(PASSWORD), false);
  });

  it("rotates the session on login: the previous session cookie is revoked (fixation)", async () => {
    const { user, client } = await signedIn(["READER"]);
    const before = client.cookie(SESSION_COOKIE)!;
    const res = await client.login(user.email, PASSWORD);
    assert.equal(res.status, 200);
    const after = client.cookie(SESSION_COOKIE)!;
    assert.notEqual(before, after);

    const stale = new Client();
    stale.setCookie(SESSION_COOKIE, before);
    assert.equal(
      (await stale.get("/api/auth/session")).body.user,
      null,
      "old session must be dead",
    );
    assert.equal((await client.get("/api/auth/session")).body.user.id, user.id);
  });

  it("refuses a login with no CSRF token, and non-JSON bodies", async () => {
    const user = await createUser(["READER"]);
    const client = new Client();
    const noToken = await client.raw("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: user.email, password: PASSWORD }),
    });
    assert.equal(noToken.status, 403);
    const form = await client.raw("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `email=${user.email}&password=${PASSWORD}`,
    });
    assert.equal(form.status, 415);
  });
});

describe("session persistence and logout", () => {
  it("keeps the user signed in across requests (refresh) and identifies them server-side", async () => {
    const { user, client } = await signedIn(["READER"]);
    for (let i = 0; i < 3; i += 1) {
      const res = await client.get("/api/auth/session");
      assert.equal(res.body.user.id, user.id);
    }
    const page = await client.get("/profile");
    assert.equal(page.status, 200);
    assert.ok(
      page.text.includes(user.email),
      "server-rendered profile should show the signed-in user",
    );
  });

  it("logout revokes the session server-side and clears cookies; the old cookie is useless", async () => {
    const { user, client } = await signedIn(["READER"]);
    const stolen = client.cookie(SESSION_COOKIE)!;
    const res = await client.post("/api/auth/logout");
    assert.equal(res.status, 200);
    assert.equal(res.setCookies.get(SESSION_COOKIE)?.maxAge, 0);
    assert.equal(client.cookie(SESSION_COOKIE), undefined);

    const replay = new Client();
    replay.setCookie(SESSION_COOKIE, stolen);
    assert.equal((await replay.get("/api/auth/session")).body.user, null);
    assert.equal((await replay.get("/api/articles")).status, 401);

    const row = await db.session.findUniqueOrThrow({ where: { tokenHash: tokenHash(stolen) } });
    assert.ok(row.revokedAt, "session row should be marked revoked");
    assert.equal(row.revokedReason, "LOGOUT");
    assert.equal((await auditEvents({ event: "AUTH_LOGOUT", actorId: user.id })).length, 1);
  });

  it("logout without a session is harmless", async () => {
    const res = await new Client().post("/api/auth/logout");
    assert.equal(res.status, 200);
  });

  it("rejects expired, idle-expired and revoked sessions, and deactivated accounts", async () => {
    const cases: { label: string; mutate: (id: string, userId: string) => Promise<unknown> }[] = [
      {
        label: "expired",
        mutate: (id) =>
          db.session.update({ where: { id }, data: { expiresAt: new Date(Date.now() - 1000) } }),
      },
      {
        label: "idle",
        mutate: (id) =>
          db.session.update({
            where: { id },
            data: { lastSeenAt: new Date(Date.now() - 8 * 86_400_000) },
          }),
      },
      {
        label: "revoked",
        mutate: (id) =>
          db.session.update({
            where: { id },
            data: { revokedAt: new Date(), revokedReason: "TEST" },
          }),
      },
      { label: "deleted", mutate: (id) => db.session.delete({ where: { id } }) },
      {
        label: "deactivated",
        mutate: (_id, userId) =>
          db.user.update({ where: { id: userId }, data: { isActive: false } }),
      },
    ];
    for (const { label, mutate } of cases) {
      const { user, client } = await signedIn(["AUTHOR"]);
      assert.equal((await client.get("/api/articles")).status, 200, `${label}: control request`);
      const row = await db.session.findUniqueOrThrow({
        where: { tokenHash: tokenHash(client.cookie(SESSION_COOKIE)!) },
      });
      await mutate(row.id, user.id);
      assert.equal((await client.get("/api/articles")).status, 401, `${label}: API must reject`);
      const me = await client.get("/api/auth/session");
      assert.equal(me.body.user, null, `${label}: session probe`);
      const page = await client.raw("/profile");
      assert.equal(page.status, 307, `${label}: page must redirect`);
    }
  });

  it("rotates the token when it is old, keeps the old one valid only briefly, then rejects it", async () => {
    const { client } = await signedIn(["READER"]);
    const original = client.cookie(SESSION_COOKIE)!;
    await db.session.update({
      where: { tokenHash: tokenHash(original) },
      data: { rotatedAt: new Date(Date.now() - 2 * 3600_000) },
    });
    const res = await client.get("/api/auth/session");
    const rotated = res.setCookies.get(SESSION_COOKIE);
    assert.ok(rotated, "server should have issued a new session token");
    assert.notEqual(rotated.value, original);
    assert.equal(rotated.httpOnly, true);

    // Grace window: a parallel tab still holding the old cookie is not logged out…
    const parallelTab = new Client();
    parallelTab.setCookie(SESSION_COOKIE, original);
    assert.ok((await parallelTab.get("/api/auth/session")).body.user);
    // …but the old token does not itself trigger further rotation or extend anything.
    assert.equal(
      (await parallelTab.get("/api/auth/session")).setCookies.has(SESSION_COOKIE),
      false,
    );

    // Once the grace window has passed the old token is dead.
    await db.session.updateMany({
      where: { previousTokenHash: tokenHash(original) },
      data: { previousValidUntil: new Date(Date.now() - 1000) },
    });
    assert.equal((await parallelTab.get("/api/auth/session")).body.user, null);
    assert.ok((await client.get("/api/auth/session")).body.user, "current token still fine");
  });
});

describe("password change", () => {
  it("requires the current password, revokes all other sessions and re-issues this one", async () => {
    const { user, client } = await signedIn(["READER"]);
    const other = new Client();
    await other.login(user.email, PASSWORD);
    const before = client.cookie(SESSION_COOKIE)!;

    const wrong = await client.post("/api/auth/password/change", {
      currentPassword: "Not-My-Password-1",
      newPassword: "Brand-New-Passphrase-7",
    });
    assert.equal(wrong.status, 403);
    assert.equal(
      (await other.get("/api/auth/session")).body.user.id,
      user.id,
      "failed change must not log anyone out",
    );

    const weak = await client.post("/api/auth/password/change", {
      currentPassword: PASSWORD,
      newPassword: "short",
    });
    assert.equal(weak.status, 422);

    const ok = await client.post("/api/auth/password/change", {
      currentPassword: PASSWORD,
      newPassword: "Brand-New-Passphrase-7",
    });
    assert.equal(ok.status, 200);
    assert.notEqual(client.cookie(SESSION_COOKIE), before, "session token must be re-issued");
    assert.equal((await client.get("/api/auth/session")).body.user.id, user.id);
    assert.equal(
      (await other.get("/api/auth/session")).body.user,
      null,
      "other device must be signed out",
    );

    assert.equal(
      (await new Client().login(user.email, PASSWORD)).status,
      401,
      "old password must stop working",
    );
    assert.equal((await new Client().login(user.email, "Brand-New-Passphrase-7")).status, 200);
    assert.equal(
      (await auditEvents({ event: "AUTH_PASSWORD_CHANGED", actorId: user.id })).length,
      1,
    );
    assert.equal(
      (await auditEvents({ event: "AUTH_PASSWORD_CHANGE_FAILED", actorId: user.id })).length,
      1,
    );
  });

  it("changes the caller's own password only — a body userId is ignored", async () => {
    const victim = await createUser(["READER"]);
    const { client } = await signedIn(["READER"]);
    const res = await client.post("/api/auth/password/change", {
      userId: victim.id,
      email: victim.email,
      currentPassword: PASSWORD,
      newPassword: "Attacker-Chosen-Pass-1",
    });
    assert.equal(res.status, 200);
    assert.equal(
      (await new Client().login(victim.email, PASSWORD)).status,
      200,
      "victim password untouched",
    );
  });

  it("requires authentication", async () => {
    const res = await new Client().post("/api/auth/password/change", {
      currentPassword: PASSWORD,
      newPassword: "Brand-New-Passphrase-7",
    });
    assert.equal(res.status, 401);
  });
});

describe("password reset", () => {
  it("answers identically for known and unknown addresses, and sends no token to unknown ones", async () => {
    const user = await createUser(["READER"]);
    const known = await new Client().post("/api/auth/password/forgot", { email: user.email });
    const unknown = await new Client().post("/api/auth/password/forgot", {
      email: uniqueEmail("nobody"),
    });
    assert.equal(known.status, 202);
    assert.equal(unknown.status, 202);
    assert.deepEqual(known.body, unknown.body);
  });

  it("resets with a single-use token, revokes every session, and does not auto-login", async () => {
    const { user, client } = await signedIn(["READER"]);
    const since = serverLogLength();
    await new Client().post("/api/auth/password/forgot", { email: user.email });
    const token = await resetTokenFor(user.email, since);

    const stored = await db.passwordResetToken.findMany({ where: { userId: user.id } });
    assert.equal(stored.length, 1);
    assert.notEqual(stored[0]!.tokenHash, token, "reset token must be stored hashed");

    const fresh = new Client();
    const done = await fresh.post("/api/auth/password/reset", {
      token,
      password: "Reset-To-This-Phrase-5",
    });
    assert.equal(done.status, 200);
    assert.ok(!done.setCookies.has(SESSION_COOKIE), "reset must not sign anyone in");
    assert.equal(
      (await client.get("/api/auth/session")).body.user,
      null,
      "existing sessions must be revoked",
    );
    assert.equal((await new Client().login(user.email, PASSWORD)).status, 401);
    assert.equal((await new Client().login(user.email, "Reset-To-This-Phrase-5")).status, 200);

    const reuse = await new Client().post("/api/auth/password/reset", {
      token,
      password: "Another-Phrase-Here-6",
    });
    assert.equal(reuse.status, 400, "token is single-use");
    assert.equal(
      (await auditEvents({ event: "AUTH_PASSWORD_RESET_COMPLETED", actorId: user.id })).length,
      1,
    );
  });

  it("rejects expired, garbage and superseded tokens with one generic message", async () => {
    const user = await createUser(["READER"]);
    const since = serverLogLength();
    await new Client().post("/api/auth/password/forgot", { email: user.email });
    const first = await resetTokenFor(user.email, since);
    await db.passwordResetToken.updateMany({
      where: { userId: user.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const expired = await new Client().post("/api/auth/password/reset", {
      token: first,
      password: "Reset-To-This-Phrase-5",
    });
    const garbage = await new Client().post("/api/auth/password/reset", {
      token: "x".repeat(43),
      password: "Reset-To-This-Phrase-5",
    });
    assert.equal(expired.status, 400);
    assert.equal(garbage.status, 400);
    assert.equal(expired.body.error, garbage.body.error);

    const since2 = serverLogLength();
    await new Client().post("/api/auth/password/forgot", { email: user.email });
    const second = await resetTokenFor(user.email, since2);
    const since3 = serverLogLength();
    await new Client().post("/api/auth/password/forgot", { email: user.email });
    const third = await resetTokenFor(user.email, since3);
    assert.notEqual(second, third);
    const superseded = await new Client().post("/api/auth/password/reset", {
      token: second,
      password: "Reset-To-This-Phrase-5",
    });
    assert.equal(superseded.status, 400, "an older link dies when a newer one is issued");
    assert.equal(
      (
        await new Client().post("/api/auth/password/reset", {
          token: third,
          password: "Reset-To-This-Phrase-5",
        })
      ).status,
      200,
    );
  });

  it("does not let a reset revive a deactivated account", async () => {
    const user = await createUser(["READER"]);
    const since = serverLogLength();
    await new Client().post("/api/auth/password/forgot", { email: user.email });
    const token = await resetTokenFor(user.email, since);
    await db.user.update({ where: { id: user.id }, data: { isActive: false } });
    const res = await new Client().post("/api/auth/password/reset", {
      token,
      password: "Reset-To-This-Phrase-5",
    });
    assert.equal(res.status, 400);
  });
});
