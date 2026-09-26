import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient, type Prisma } from "@prisma/client";

/**
 * Builds a Prisma client that talks to Turso (libSQL) through the driver adapter.
 * DATABASE_URL is `libsql://<db>.turso.io` in production, or `file:./dev.db` for a
 * local SQLite file; TURSO_AUTH_TOKEN is only needed for remote databases.
 */
export function createPrismaClient(options: Omit<Prisma.PrismaClientOptions, "adapter"> = {}) {
  loadDotEnv();
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not set.");
  const adapter = new PrismaLibSQL({ url, authToken: process.env["TURSO_AUTH_TOKEN"] ?? "" });
  return new PrismaClient({ ...options, adapter });
}

/** Next.js loads .env itself; standalone scripts (tsx prisma/*.ts) need it loaded here. */
export function loadDotEnv() {
  if (process.env["DATABASE_URL"]) return;
  try {
    process.loadEnvFile(".env");
  } catch {
    /* no .env: rely on the real environment */
  }
}
