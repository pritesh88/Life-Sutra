import { json, publicRoute } from "@/lib/api/route";
import { CSRF_COOKIE } from "@/lib/auth/config";
import { randomToken, tokenHash, tokensMatch } from "@/lib/auth/crypto";
import { setCsrfCookie } from "@/lib/auth/session";
import { rotateCsrfToken } from "@/lib/auth/session-store";

export const runtime = "nodejs";

const ANONYMOUS_TTL_MS = 2 * 60 * 60 * 1000;
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;

/**
 * Establishes the CSRF cookie the client echoes in `X-CSRF-Token`.
 * Signed in: the token is bound to the server-side session (and only rotated
 * when the browser's copy no longer matches). Signed out: a random token is
 * enough for the double-submit check on login/register.
 */
export const GET = publicRoute({}, async ({ request, session }) => {
  const existing = request.cookies.get(CSRF_COOKIE)?.value;
  const response = json({ ok: true });
  if (session) {
    const reusable = existing && tokensMatch(tokenHash(existing), session.session.csrfTokenHash);
    const token = reusable ? existing : await rotateCsrfToken(session.session.id);
    setCsrfCookie(response, token, session.session.expiresAt);
  } else {
    const token = existing && TOKEN_SHAPE.test(existing) ? existing : randomToken();
    setCsrfCookie(response, token, new Date(Date.now() + ANONYMOUS_TTL_MS));
  }
  return response;
});
