/** Only same-site relative paths are honoured after login (no open redirect). */
export function safeNextPath(value: string | string[] | undefined | null): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    candidate.startsWith("/auth/")
  )
    return "/profile";
  return candidate;
}
