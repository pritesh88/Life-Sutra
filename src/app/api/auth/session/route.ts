import { json, publicRoute } from "@/lib/api/route";
import { clearSessionCookies, rotateSessionIfDue } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/config";

export const runtime = "nodejs";

/** Who am I? The browser UI calls this on load; the answer is computed server-side. */
export const GET = publicRoute({}, async ({ request, session }) => {
  if (!session) {
    const response = json({ user: null });
    // A dead session cookie is cleared so the browser stops sending it.
    if (request.cookies.get(SESSION_COOKIE)) clearSessionCookies(response);
    return response;
  }
  const response = json({ user: session.user });
  await rotateSessionIfDue(request, response, session);
  return response;
});
