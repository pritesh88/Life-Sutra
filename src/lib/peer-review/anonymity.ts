import { createHash } from "node:crypto";

/**
 * Helpers that derive reviewer-safe identifiers. Nothing here can be reversed
 * to an author or a database id.
 */

/** Public manuscript code used in correspondence. One-way: not derivable back to the row id. */
export function manuscriptCode(articleId: string) {
  return `LS-${createHash("sha256").update(`manuscript:${articleId}`).digest("hex").slice(0, 8).toUpperCase()}`;
}

const SAFE_EXTENSIONS = new Set(["pdf", "docx", "doc", "odt", "txt", "tex", "rtf"]);

/**
 * What a reviewer is allowed to see as the manuscript's filename. Authors
 * routinely name files "Surname_Title_final.docx"; the original name is never
 * shown to reviewers — only a neutral name plus a whitelisted extension.
 */
export function anonymizedFileName(articleId: string, originalName: string | null) {
  if (!originalName) return null;
  const extension = originalName.split(".").pop()?.toLowerCase() ?? "";
  const base = `manuscript-${manuscriptCode(articleId)}`;
  return SAFE_EXTENSIONS.has(extension) ? `${base}.${extension}` : base;
}
