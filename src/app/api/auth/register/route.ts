import { json, publicRoute, readJson } from "@/lib/api/route";
import { registerAccount } from "@/lib/auth/service";
import { setSessionCookies } from "@/lib/auth/session";
import { registerSchema } from "@/lib/auth/validation";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

export const POST = publicRoute({}, async ({ request }) => {
  const input = await readJson(request, registerSchema);
  const { user, session } = await registerAccount(input, getClientInfo(request.headers));
  const response = json({ user }, 201);
  setSessionCookies(response, session);
  return response;
});
