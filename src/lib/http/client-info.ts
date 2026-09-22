/**
 * Client IP resolution. `X-Forwarded-For` is attacker-controlled unless a
 * proxy you operate appends to it, so we only read the entry that many
 * trusted proxies from the right (TRUSTED_PROXY_COUNT, default 1). Set it to
 * 0 to ignore the header entirely. IP is used for throttling and audit only —
 * never for authorization.
 */
export function trustedProxyCount() {
  const raw = Number.parseInt(process.env["TRUSTED_PROXY_COUNT"] ?? "1", 10);
  return Number.isFinite(raw) && raw >= 0 && raw <= 5 ? raw : 1;
}

export function getClientIp(headers: Headers): string {
  const hops = trustedProxyCount();
  if (hops === 0) return "unknown";
  const forwarded = headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";
  const chain = forwarded
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const candidate = chain[chain.length - hops];
  return candidate && candidate.length <= 64 ? candidate : "unknown";
}

export type ClientInfo = { ipAddress: string; userAgent: string | null };

export function getClientInfo(headers: Headers): ClientInfo {
  return {
    ipAddress: getClientIp(headers),
    userAgent: headers.get("user-agent")?.slice(0, 300) ?? null,
  };
}
