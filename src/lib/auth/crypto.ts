import argon2 from "argon2";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // KiB — OWASP minimum profile for argon2id
  timeCost: 2,
  parallelism: 1,
} as const;

/** 256-bit random opaque token (session ids, CSRF tokens, reset tokens). */
export function randomToken() {
  return randomBytes(32).toString("base64url");
}

/** Only the SHA-256 of a token is ever stored; the raw token lives in the cookie/email. */
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function hashPassword(password: string) {
  return argon2.hash(password.normalize("NFKC"), ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await argon2.verify(passwordHash, password.normalize("NFKC"));
  } catch {
    return false;
  }
}

export function passwordNeedsRehash(passwordHash: string) {
  return argon2.needsRehash(passwordHash, ARGON2_OPTIONS);
}

let dummyHash: Promise<string> | undefined;

/**
 * Verify against a real argon2 hash even when the account does not exist, so
 * response time does not reveal which emails are registered.
 */
export async function verifyPasswordOrBurn(passwordHash: string | null, password: string) {
  if (passwordHash) return verifyPassword(passwordHash, password);
  dummyHash ??= hashPassword("timing-equalisation-only");
  await verifyPassword(await dummyHash, password);
  return false;
}
