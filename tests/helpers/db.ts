import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../src/lib/auth/crypto";
import type { RoleCode } from "../../src/lib/auth/rbac/catalog";
import { Client } from "./http";

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl || !/_test\b/.test(new URL(databaseUrl).pathname)) {
  throw new Error("Integration tests must run against a *_test database (use `npm test`).");
}

/** Direct DB access for fixtures and assertions (the app under test uses its own connection). */
export const db = new PrismaClient();

export const PASSWORD = "Correct-Horse-Battery-9";
let passwordHash: Promise<string> | undefined;
const sharedHash = () => (passwordHash ??= hashPassword(PASSWORD));

export const uniqueEmail = (label = "user") =>
  `${label}.${randomBytes(5).toString("hex")}@example.test`;

export type Fixture = { id: string; email: string; name: string };

/** Creates a user with exactly the given roles, bypassing the API (the API only ever grants defaults). */
export async function createUser(
  roles: RoleCode[],
  options: { email?: string; name?: string; password?: string; isActive?: boolean } = {},
): Promise<Fixture> {
  const email = options.email ?? uniqueEmail(roles[0]?.toLowerCase() ?? "user");
  const name = options.name ?? `Test ${roles[0] ?? "User"}`;
  const roleRows = await db.role.findMany({ where: { code: { in: roles } } });
  if (roleRows.length !== roles.length) throw new Error("roles are not seeded");
  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash: options.password ? await hashPassword(options.password) : await sharedHash(),
      isActive: options.isActive ?? true,
      roles: { create: roleRows.map((role) => ({ roleId: role.id, assignedBy: "test-fixture" })) },
    },
  });
  return { id: user.id, email, name };
}

/** A fresh browser session signed in as a brand-new user holding `roles`. */
export async function signedIn(roles: RoleCode[], options: { name?: string } = {}) {
  const user = await createUser(roles, options);
  const client = new Client();
  const res = await client.login(user.email, PASSWORD);
  if (res.status !== 200) throw new Error(`fixture login failed: ${res.status} ${res.text}`);
  return { user, client };
}

export async function auditEvents(where: Record<string, unknown>) {
  return db.auditLog.findMany({ where, orderBy: { createdAt: "asc" } });
}

/** Waits for the console mail transport to print the reset link for `email`. */
export async function resetTokenFor(email: string, since: number): Promise<string> {
  const logPath = process.env["TEST_SERVER_LOG"];
  if (!logPath) throw new Error("TEST_SERVER_LOG is not set");
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    const log = readFileSync(logPath, "utf8").slice(since);
    const matches = [
      ...log.matchAll(
        new RegExp(
          `\\[mail\\] to=${email.replace(/[.+]/g, "\\$&")}[\\s\\S]*?#token=([A-Za-z0-9_-]+)`,
          "g",
        ),
      ),
    ];
    const last = matches[matches.length - 1];
    if (last?.[1]) return last[1];
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`no reset mail for ${email}`);
}

export const serverLogLength = () => {
  const logPath = process.env["TEST_SERVER_LOG"];
  return logPath ? readFileSync(logPath, "utf8").length : 0;
};

/** Every string leaf in a JSON value — used to prove identities never appear in a response. */
export function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out));
  else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      out.push(key);
      allStrings(v, out);
    }
  }
  return out;
}
