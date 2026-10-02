/**
 * URL structure of the publisher site. I Smart Life Foundation owns the root;
 * each publication lives under /publications/<slug>.
 *
 * Pre-restructure journal URLs (/research, /archive, /articles/:id, …) are
 * redirected in next.config.ts — keep that list in step with this file.
 */

export const JOURNAL_BASE = "/publications/life-sutra-synthesis";
export const IMPRINT_BASE = "/publications/life-sutra";

/** Path inside the Life Sutra Synthesis journal, e.g. journalPath("/archive"). */
export function journalPath(path = "") {
  return `${JOURNAL_BASE}${path}`;
}

export const FOUNDATION_ROUTES = {
  home: "/",
  about: "/about",
  visionMission: "/vision-mission",
  approach: "/approach",
  publications: "/publications",
  books: "/books",
  contact: "/contact",
} as const;
