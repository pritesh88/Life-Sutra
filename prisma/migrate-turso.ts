import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import { loadDotEnv } from "../src/lib/prisma-client";

/**
 * Applies prisma/migrations/* to the Turso database in DATABASE_URL, in order,
 * skipping any already recorded in "_turso_migrations". `prisma migrate deploy`
 * cannot connect to libsql:// URLs, so this replaces it (`npm run db:deploy`).
 *
 * New migrations: change schema.prisma, then run `npm run db:migrate` (creates
 * the SQL against the local file:./dev.db) and `npm run db:deploy`.
 */
async function main() {
  loadDotEnv();
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not set.");
  const client = createClient({ url, authToken: process.env["TURSO_AUTH_TOKEN"] ?? "" });

  try {
    await client.execute(
      `CREATE TABLE IF NOT EXISTS "_turso_migrations" ("name" TEXT PRIMARY KEY, "appliedAt" TEXT NOT NULL)`,
    );
    const applied = new Set(
      (await client.execute(`SELECT "name" FROM "_turso_migrations"`)).rows.map((row) =>
        String(row["name"]),
      ),
    );

    const dir = join(process.cwd(), "prisma", "migrations");
    const pending = readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !applied.has(entry.name))
      .map((entry) => entry.name)
      .sort();

    for (const name of pending) {
      const sql = readFileSync(join(dir, name, "migration.sql"), "utf8");
      await client.executeMultiple(`BEGIN;\n${sql}\nCOMMIT;`).catch(async (error: unknown) => {
        await client.execute("ROLLBACK").catch(() => {});
        throw error;
      });
      await client.execute({
        sql: `INSERT INTO "_turso_migrations" ("name", "appliedAt") VALUES (?, ?)`,
        args: [name, new Date().toISOString()],
      });
      console.log(`✔ applied ${name}`);
    }
    console.log(pending.length ? `${pending.length} migration(s) applied.` : "Database is up to date.");
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
