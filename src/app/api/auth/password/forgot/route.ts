import { json, publicRoute, readJson } from "@/lib/api/route";
import { requestPasswordReset } from "@/lib/auth/service";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

export const POST = publicRoute({}, async ({ request }) => {
  const { email } = await readJson(request, forgotPasswordSchema);
  await requestPasswordReset(email, getClientInfo(request.headers));
  // Identical whether or not the address is registered.
  return json(
    { ok: true, message: "If that address has an account, a reset link is on its way." },
    202,
  );
});
