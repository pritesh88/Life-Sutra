import type { NextRequest } from "next/server";
import { CSRF_COOKIE } from "@/lib/auth/config";
import { tokenHash, tokensMatch } from "@/lib/auth/crypto";
import type { ResolvedSession } from "@/lib/auth/session-store";
import { getSiteUrl } from "@/lib/site";

/**
 * Session-bound double-submit CSRF. The token is in a JS-readable cookie and
 * must be echoed in `X-CSRF-Token`. For an authenticated request the token's
 * hash must also match the one stored on the server-side session, so a token
 * planted by another origin/subdomain is worthless.
 */
export function csrfValid(request: NextRequest, current: ResolvedSession | null) {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get("x-csrf-token");
  if (!cookieToken || !headerToken || !tokensMatch(cookieToken, headerToken)) return false;
  return !current || tokensMatch(tokenHash(cookieToken), current.session.csrfTokenHash);
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
export const isMutation = (method: string) => !SAFE_METHODS.has(method.toUpperCase());

/**
 * Defence in depth on top of the token: browsers attach `Origin` and
 * `Sec-Fetch-Site` to cross-site requests, so refuse any that say cross-site.
 * Non-browser clients send neither and are still subject to the token check.
 */
export function originAllowed(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    // The host the browser actually used may be rewritten by a proxy, so also
    // accept the site's own configured origin (NEXT_PUBLIC_SITE_URL).
    const acceptable = [
      request.headers.get("x-forwarded-host"),
      request.headers.get("host"),
      new URL(getSiteUrl()).host,
    ];
    return acceptable.includes(originHost);
  } catch {
    return false;
  }
}
