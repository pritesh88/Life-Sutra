/** Central auth tunables. Cookie names, lifetimes and throttle policies live here. */

const production = process.env.NODE_ENV === "production";

export const SESSION_COOKIE = production ? "__Host-life_sutra_session" : "life_sutra_session";
export const CSRF_COOKIE = production ? "__Host-life_sutra_csrf" : "life_sutra_csrf";

/** Absolute cap: a session never lives longer than this, however active. */
export const SESSION_ABSOLUTE_SECONDS = 60 * 60 * 24 * 30;
/** Idle timeout: a session unused for this long is dead. */
export const SESSION_IDLE_SECONDS = 60 * 60 * 24 * 7;
/** The opaque token is re-issued once it is older than this. */
export const SESSION_ROTATE_AFTER_SECONDS = 60 * 60;
/** The pre-rotation token keeps working briefly so parallel tabs do not race. */
export const SESSION_ROTATION_GRACE_SECONDS = 60;
/** `lastSeenAt` is written at most this often (avoids a write per request). */
export const SESSION_TOUCH_INTERVAL_SECONDS = 60;

export const PASSWORD_RESET_TTL_SECONDS = 60 * 30;

export const cookieBase = {
  httpOnly: true,
  secure: production,
  sameSite: "lax" as const,
  path: "/",
};

export const cookieSecure = production;

export type Throttle = { limit: number; windowSeconds: number };

/**
 * Brute-force policy. Per-identity (email + IP) stops a single client
 * guessing; per-email caps distributed guessing against one account while
 * still leaving the real owner (a different IP) able to sign in; per-IP caps
 * spraying across many accounts.
 */
export const THROTTLE = {
  loginIp: { limit: 30, windowSeconds: 15 * 60 },
  loginIdentity: { limit: 5, windowSeconds: 15 * 60 },
  loginEmail: { limit: 20, windowSeconds: 15 * 60 },
  registerIp: { limit: 10, windowSeconds: 60 * 60 },
  forgotIp: { limit: 10, windowSeconds: 60 * 60 },
  forgotEmail: { limit: 3, windowSeconds: 60 * 60 },
  resetIp: { limit: 20, windowSeconds: 60 * 60 },
  passwordChangeUser: { limit: 5, windowSeconds: 15 * 60 },
} satisfies Record<string, Throttle>;
