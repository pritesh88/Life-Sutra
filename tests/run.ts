/**
 * Test orchestrator: `npm test`
 *
 *   1. (re)creates an isolated database `<name>_test` (never your dev database)
 *   2. applies the checked-in migrations and syncs RBAC
 *   3. builds the app into .next-test and starts `next start` on TEST_PORT
 *      (a real production server: Secure/__Host- cookies, headers, middleware)
 *   4. runs the node:test suites against it, serially
 *
 * Flags: --no-build  reuse the previous .next-test build
 */
import { spawn, spawnSync } from "node:child_process";
import { closeSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();
const port = process.env["TEST_PORT"] ?? "3100";
const skipBuild = process.argv.includes("--no-build");

try {
  process.loadEnvFile(join(root, ".env"));
} catch {
  /* .env is optional when DATABASE_URL / TEST_DATABASE_URL are already set */
}

function testDatabaseUrl() {
  const explicit = process.env["TEST_DATABASE_URL"];
  if (explicit) return explicit;
  const base = process.env["DATABASE_URL"];
  if (!base) throw new Error("Set TEST_DATABASE_URL (or DATABASE_URL) to a PostgreSQL server.");
  const url = new URL(base);
  const name = url.pathname.replace(/^\//, "") || "life_sutra";
  url.pathname = `/${name.endsWith("_test") ? name : `${name}_test`}`;
  return url.toString();
}

const databaseUrl = testDatabaseUrl();
const databaseName = new URL(databaseUrl).pathname.replace(/^\//, "");
if (!/_test$/.test(databaseName)) {
  throw new Error(`Refusing to run: database "${databaseName}" does not end in _test.`);
}

const nodeBin = process.execPath;
const bin = (...parts: string[]) => join(root, "node_modules", ...parts);

const testEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  NEXT_DIST_DIR: ".next-test",
  MAIL_TRANSPORT: "console",
  TRUSTED_PROXY_COUNT: "1",
  NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
  TEST_BASE_URL: `http://localhost:${port}`,
  TEST_SERVER_LOG: join(root, "tests", ".server.log"),
  NEXT_TELEMETRY_DISABLED: "1",
};

function run(label: string, args: string[], env = testEnv) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(nodeBin, args, { cwd: root, env, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${label} failed (exit ${result.status})`);
}

async function recreateDatabase() {
  const admin = new URL(databaseUrl);
  admin.pathname = "/postgres";
  const client = new PrismaClient({ datasourceUrl: admin.toString() });
  try {
    await client.$executeRawUnsafe(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${databaseName}' AND pid <> pg_backend_pid()`,
    );
    await client.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${databaseName}"`);
    await client.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);
  } finally {
    await client.$disconnect();
  }
  console.log(`▶ database "${databaseName}" recreated`);
}

async function waitForServer(baseUrl: string) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/session`);
      if (response.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Test server did not become ready in 60s (see tests/.server.log).");
}

async function main() {
  await recreateDatabase();
  run("prisma migrate deploy", [bin("prisma", "build", "index.js"), "migrate", "deploy"]);
  run("rbac sync (seed)", [bin("tsx", "dist", "cli.mjs"), "prisma/seed.ts"]);
  if (!skipBuild) run("next build", [bin("next", "dist", "bin", "next"), "build"]);

  mkdirSync(join(root, "tests"), { recursive: true });
  const logFd = openSync(testEnv.TEST_SERVER_LOG, "w");
  const server = spawn(nodeBin, [bin("next", "dist", "bin", "next"), "start", "-p", port], {
    cwd: root,
    env: { ...testEnv, NODE_ENV: "production" },
    stdio: ["ignore", logFd, logFd],
  });
  let exitCode = 1;
  try {
    await waitForServer(testEnv.TEST_BASE_URL);
    console.log(`▶ server ready on ${testEnv.TEST_BASE_URL}`);
    const filter = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
    const files = filter.length > 0 ? filter : ["tests/**/*.test.ts"];
    const result = spawnSync(
      nodeBin,
      ["--import", "tsx", "--test", "--test-concurrency=1", "--test-timeout=120000", ...files],
      { cwd: root, env: testEnv, stdio: "inherit" },
    );
    exitCode = result.status ?? 1;
  } finally {
    server.kill();
    closeSync(logFd);
  }
  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
