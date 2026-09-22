import { json, publicRoute, readJson } from "@/lib/api/route";
import { SESSION_COOKIE } from "@/lib/auth/config";
import { loginWithPassword } from "@/lib/auth/service";
import { setSessionCookies } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/validation";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

export const POST = publicRoute({}, async ({ request }) => {
  const input = await readJson(request, loginSchema);
  const { user, session } = await loginWithPassword(
    input,
    getClientInfo(request.headers),
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const response = json({ user });
  setSessionCookies(response, session);
  return response;
});
