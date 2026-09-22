import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeMetadata } from "../../src/lib/auth/audit";
import { hashPassword, verifyPassword, verifyPasswordOrBurn } from "../../src/lib/auth/crypto";
import { isSupersetOf } from "../../src/lib/auth/rbac/authorize";
import {
  DEFAULT_REGISTRATION_ROLES,
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  permissionsForRoles,
} from "../../src/lib/auth/rbac/catalog";
import { safeNextPath } from "../../src/lib/auth/redirect";
import { passwordPolicyViolation, registerSchema } from "../../src/lib/auth/validation";
import { getClientIp } from "../../src/lib/http/client-info";
import { anonymizedFileName, manuscriptCode } from "../../src/lib/peer-review/anonymity";

describe("RBAC catalog", () => {
  it("defines exactly the twelve required roles", () => {
    assert.deepEqual(
      [...ROLES].sort(),
      [
        "AUTHOR",
        "CONTENT_EDITOR",
        "EDITOR",
        "INSTITUTION_MEMBER",
        "JOURNAL_ADMIN",
        "READER",
        "RESEARCH_ADMIN",
        "RESEARCHER",
        "REVIEWER",
        "REVIEWER_MANAGER",
        "SUPER_ADMIN",
        "SUPPORT_ADMIN",
      ].sort(),
    );
  });

  it("defines every permission the brief names", () => {
    for (const permission of [
      "article:create",
      "article:edit",
      "article:submit",
      "article:review",
      "article:publish",
      "review:assign",
      "review:submit",
      "user:manage",
      "role:manage",
      "institution:manage",
      "opportunity:manage",
      "methodology:manage",
      "dialogue:moderate",
      "audit:view",
    ]) {
      assert.ok((PERMISSIONS as string[]).includes(permission), `${permission} missing`);
    }
  });

  it("only grants permissions that exist, and every role has an entry", () => {
    for (const role of ROLES) {
      assert.ok(ROLE_PERMISSIONS[role], `${role} has no mapping`);
      for (const permission of ROLE_PERMISSIONS[role]) assert.ok(PERMISSIONS.includes(permission));
    }
  });

  it("SUPER_ADMIN holds everything; nobody else can manage roles or read the audit log by accident", () => {
    assert.equal(ROLE_PERMISSIONS.SUPER_ADMIN.length, PERMISSIONS.length);
    for (const role of ROLES.filter((r) => r !== "SUPER_ADMIN")) {
      assert.ok(!ROLE_PERMISSIONS[role].includes("role:manage"), `${role} must not manage roles`);
    }
    const auditors = ROLES.filter((r) => ROLE_PERMISSIONS[r].includes("audit:view"));
    assert.deepEqual([...auditors].sort(), ["JOURNAL_ADMIN", "SUPER_ADMIN"]);
  });

  it("self-registration can never grant an elevated role or any admin permission", () => {
    const granted = permissionsForRoles(DEFAULT_REGISTRATION_ROLES);
    for (const forbidden of [
      "role:manage",
      "user:manage",
      "audit:view",
      "review:assign",
      "review:submit",
      "review:view-identities",
      "article:review",
      "article:publish",
    ] as const) {
      assert.ok(!granted.has(forbidden), `self-registered users must not hold ${forbidden}`);
    }
  });

  it("reviewers cannot author/edit and cannot see identities; editors cannot review", () => {
    assert.ok(!ROLE_PERMISSIONS.REVIEWER.includes("review:view-identities"));
    assert.ok(!ROLE_PERMISSIONS.REVIEWER.includes("article:create"));
    assert.ok(!ROLE_PERMISSIONS.AUTHOR.includes("review:submit"));
    assert.ok(!ROLE_PERMISSIONS.EDITOR.includes("review:submit"));
  });

  it("isSupersetOf is a strict subset test (used to block privilege escalation)", () => {
    assert.ok(isSupersetOf(ROLE_PERMISSIONS.SUPER_ADMIN, ROLE_PERMISSIONS.EDITOR));
    assert.ok(!isSupersetOf(ROLE_PERMISSIONS.EDITOR, ROLE_PERMISSIONS.SUPER_ADMIN));
    assert.ok(!isSupersetOf(ROLE_PERMISSIONS.SUPPORT_ADMIN, ROLE_PERMISSIONS.EDITOR));
  });
});

describe("passwords", () => {
  it("hashes with argon2id, never stores plaintext, and verifies", async () => {
    const hash = await hashPassword("Correct-Horse-Battery-9");
    assert.match(hash, /^\$argon2id\$/);
    assert.ok(!hash.includes("Correct-Horse"));
    assert.equal(await verifyPassword(hash, "Correct-Horse-Battery-9"), true);
    assert.equal(await verifyPassword(hash, "Correct-Horse-Battery-8"), false);
    assert.equal(await verifyPassword("not-a-hash", "x"), false);
  });

  it("burns a real verification when the account does not exist", async () => {
    const started = performance.now();
    assert.equal(await verifyPasswordOrBurn(null, "whatever-password-1"), false);
    // A real argon2 verify takes measurable time; a skipped one takes well under 5ms.
    assert.ok(performance.now() - started > 5, "unknown-account path skipped the hash work");
  });

  it("enforces the password policy", () => {
    assert.equal(
      registerSchema.safeParse({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "short1",
      }).success,
      false,
    );
    assert.equal(
      registerSchema.safeParse({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "onlyletterslongenough",
      }).success,
      false,
    );
    assert.equal(
      registerSchema.safeParse({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "123456789012345",
      }).success,
      false,
    );
    assert.equal(
      registerSchema.safeParse({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "x".repeat(200) + "1",
      }).success,
      false,
    );
    assert.ok(passwordPolicyViolation("password1234"));
    assert.ok(
      passwordPolicyViolation("my-ada.lovelace-pass-1", { email: "ada.lovelace@example.com" }),
    );
    assert.equal(
      passwordPolicyViolation("Correct-Horse-Battery-9", { email: "ada@example.com" }),
      null,
    );
  });

  it("strips client-supplied roles/ids from the registration payload", () => {
    const parsed = registerSchema.parse({
      name: "Ada Lovelace",
      email: "ADA@Example.com ",
      password: "Correct-Horse-Battery-9",
      roles: ["SUPER_ADMIN"],
      role: "SUPER_ADMIN",
      userId: "someone-else",
      isActive: true,
    });
    assert.deepEqual(Object.keys(parsed).sort(), ["email", "name", "password"]);
    assert.equal(parsed.email, "ada@example.com");
  });
});

describe("request plumbing", () => {
  it("only trusts the X-Forwarded-For hop the configured proxies add", () => {
    process.env["TRUSTED_PROXY_COUNT"] = "1";
    const spoofed = new Headers({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" });
    assert.equal(
      getClientIp(spoofed),
      "203.0.113.9",
      "the client-supplied left entry must be ignored",
    );
    process.env["TRUSTED_PROXY_COUNT"] = "0";
    assert.equal(getClientIp(spoofed), "unknown");
    delete process.env["TRUSTED_PROXY_COUNT"];
  });

  it("only allows same-site relative redirect targets after login", () => {
    assert.equal(safeNextPath("/editor/queue"), "/editor/queue");
    for (const evil of [
      "//evil.example",
      "https://evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "/auth/login",
      undefined,
      "",
    ])
      assert.equal(safeNextPath(evil), "/profile", `should reject ${String(evil)}`);
  });

  it("redacts credentials from audit metadata", () => {
    const clean = sanitizeMetadata({
      email: "a@b.c",
      password: "hunter2",
      resetToken: "abc",
      sessionCookie: "x",
      note: "ok",
    }) as Record<string, unknown>;
    assert.equal(clean["password"], "[redacted]");
    assert.equal(clean["resetToken"], "[redacted]");
    assert.equal(clean["sessionCookie"], "[redacted]");
    assert.equal(clean["email"], "a@b.c");
    assert.equal(clean["note"], "ok");
  });
});

describe("reviewer-facing identifiers", () => {
  it("manuscript codes are stable, opaque and do not contain the row id", () => {
    const id = "cm0abcdefghij123456789";
    assert.equal(manuscriptCode(id), manuscriptCode(id));
    assert.match(manuscriptCode(id), /^LS-[0-9A-F]{8}$/);
    assert.ok(!manuscriptCode(id).toLowerCase().includes(id.slice(-6)));
  });

  it("replaces author-chosen filenames with a neutral one", () => {
    const named = anonymizedFileName("art1", "Sharma_Ananya_Bhava_final_v3.docx");
    assert.match(named ?? "", /^manuscript-LS-[0-9A-F]{8}\.docx$/);
    assert.ok(!/sharma|ananya/i.test(named ?? ""));
    assert.match(anonymizedFileName("art1", "Sharma.exe") ?? "", /^manuscript-LS-[0-9A-F]{8}$/);
    assert.equal(anonymizedFileName("art1", null), null);
  });
});
