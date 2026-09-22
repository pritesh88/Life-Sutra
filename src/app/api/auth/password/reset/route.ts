import { json, publicRoute, readJson } from "@/lib/api/route";
import { completePasswordReset } from "@/lib/auth/service";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { getClientInfo } from "@/lib/http/client-info";

export const runtime = "nodejs";

export const POST = publicRoute({}, async ({ request }) => {
  const input = await readJson(request, resetPasswordSchema);
  await completePasswordReset(input, getClientInfo(request.headers));
  return json({ ok: true });
});
