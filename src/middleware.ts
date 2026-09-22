import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/config";

/**
 * Edge gate for signed-in-only PAGES. This is a UX convenience (skip rendering
 * a page you will be bounced from anyway) — it only checks that a session
 * cookie exists. It proves nothing: the page and every API route validate the
 * session against the database and check permissions themselves.
 */
const SIGNED_IN_PREFIXES = ["/profile", "/admin", "/editor", "/reviews"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const needsSession = SIGNED_IN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (needsSession && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/editor/:path*", "/reviews/:path*"],
};
