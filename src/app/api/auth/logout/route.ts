import { json, publicRoute } from "@/lib/api/route";
import { SESSION_COOKIE } from "@/lib/auth/config";
import { logout } from "@/lib/auth/service";
import { clearSessionCookies } from "@/lib/auth/session";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

export const POST = publicRoute({}, async ({ request, session }) => {
  await logout(
    request.cookies.get(SESSION_COOKIE)?.value,
    session ? { userId: session.user.id } : null,
    getClientInfo(request.headers),
  );
  const response = json({ ok: true });
  clearSessionCookies(response);
  return response;
});
