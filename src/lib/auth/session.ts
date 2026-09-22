import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  SESSION_ROTATE_AFTER_SECONDS,
  cookieBase,
  cookieSecure,
} from "@/lib/auth/config";
import {
  resolveSession,
  rotateSessionToken,
  type NewSession,
  type ResolvedSession,
} from "@/lib/auth/session-store";

/**
 * Request/cookie glue around the session store. Server components use
 * getCurrentSession(); route handlers use getRequestSession(request).
 */

export const sessionCookieName = () => SESSION_COOKIE;
export const getCsrfCookieName = () => CSRF_COOKIE;

export async function getCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? resolveSession(token) : null;
}

export async function getCurrentUser() {
  return (await getCurrentSession())?.user ?? null;
}

export async function getRequestSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return token ? resolveSession(token) : null;
}

const maxAgeUntil = (expiresAt: Date) =>
  Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE, token, {
    ...cookieBase,
    maxAge: maxAgeUntil(expiresAt),
    expires: expiresAt,
  });
}

/** The CSRF cookie must be readable by JS (double-submit), so it is not HttpOnly. */
export function setCsrfCookie(response: NextResponse, csrfToken: string, expiresAt: Date) {
  response.cookies.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeUntil(expiresAt),
    expires: expiresAt,
  });
}

export function setSessionCookies(response: NextResponse, session: NewSession) {
  setSessionCookie(response, session.token, session.expiresAt);
  setCsrfCookie(response, session.csrfToken, session.expiresAt);
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { ...cookieBase, maxAge: 0 });
  response.cookies.set(CSRF_COOKIE, "", {
    httpOnly: false,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Periodic token rotation. Only route handlers can set cookies, so this runs
 * from /api/auth/session, which the app calls on every full page load.
 */
export async function rotateSessionIfDue(
  request: NextRequest,
  response: NextResponse,
  current: ResolvedSession,
) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token || current.viaPreviousToken) return false;
  const age = Date.now() - current.session.rotatedAt.getTime();
  if (age < SESSION_ROTATE_AFTER_SECONDS * 1000) return false;
  const next = await rotateSessionToken(current.session.id, token);
  if (!next) return false;
  setSessionCookie(response, next, current.session.expiresAt);
  return true;
}
