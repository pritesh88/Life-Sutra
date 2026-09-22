import { json, protectedRoute, readJson } from "@/lib/api/route";
import { changePassword } from "@/lib/auth/service";
import { setSessionCookies } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/auth/validation";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

/** The account is taken from the session, never from the request body. */
export const POST = protectedRoute({}, async ({ request, user }) => {
  const input = await readJson(request, changePasswordSchema);
  const result = await changePassword(
    { userId: user.id, currentPassword: input.currentPassword, newPassword: input.newPassword },
    getClientInfo(request.headers),
  );
  const response = json({ ok: true });
  setSessionCookies(response, result.session);
  return response;
});
