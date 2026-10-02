/**
 * Journal particulars and bibliographic data — the single source for the
 * ISSN-facing details (home page table, footer, archive, article pages).
 *
 * Values marked TBC are still awaiting confirmation from the publisher.
 */
import { FOUNDATION, foundationAddress } from "@/data/foundation";
import { journalPath } from "@/lib/routes";
import { SITE_EMAIL, SITE_NAME, getSiteUrl } from "@/lib/site";

export const TBC = "To be confirmed";

export const JOURNAL = {
  title: SITE_NAME,
  subtitle: "Journal of Mind, Consciousness Studies, and Synthesis of Indian Knowledge Systems",
  startingYear: 2026,
  frequency: "Quarterly",
  format: "Online",
  subject: "Indian Knowledge Systems; Mind and Consciousness Studies; Interdisciplinary Research",
  language: "English",
  issn: "Applied for",
  firstIssue: "11 October 2026",
  peerReview: "Double-anonymous peer review",
  access: "Open access",
  license: "CC BY-NC 4.0",
  email: SITE_EMAIL,
  publisher: {
    name: FOUNDATION.publishingBody,
    type: "Institutional publisher (Section 8 company) — not an individual publisher",
    owner: FOUNDATION.owner,
    /** Locality only until the full registered address is verified — see FOUNDATION.contact. */
    address: FOUNDATION.contact.registeredAddress
      ? foundationAddress()
      : `${foundationAddress()} (full registered address ${TBC.toLowerCase()})`,
    email: FOUNDATION.contact.email,
    phone: FOUNDATION.contact.phone,
    website: FOUNDATION.website,
  },
  editorInChief: {
    name: "Dr. Mahesh Lohar",
    affiliation: "I Smart Life Foundation",
    email: "ismart@manasyog.com",
  },
} as const;

export function journalUrl() {
  return `${getSiteUrl()}${journalPath()}`;
}

export type JournalIssue = {
  /** URL slug, e.g. "v1-i1". */
  id: string;
  volume: number;
  number: number;
  /** Period of publication covered by the issue, e.g. "October–December". */
  months: string;
  year: number;
  publishedOn: string;
};

/** Newest first. Quarterly: one issue per quarter, one volume per year. */
export const journalIssues: JournalIssue[] = [
  {
    id: "v1-i1",
    volume: 1,
    number: 1,
    months: "October–December",
    year: 2026,
    publishedOn: "11 October 2026",
  },
];

export function getIssue(id: string) {
  return journalIssues.find((i) => i.id === id);
}

/** "Vol. 1, Issue 1" */
export function issueNumberLabel(issue: JournalIssue) {
  return `Vol. ${issue.volume}, Issue ${issue.number}`;
}

/** "October–December 2026" */
export function issuePeriodLabel(issue: JournalIssue) {
  return `${issue.months} ${issue.year}`;
}

/** "Vol. 1, Issue 1 (October–December 2026)" */
export function issueLabel(issue: JournalIssue) {
  return `${issueNumberLabel(issue)} (${issuePeriodLabel(issue)})`;
}

export function issuePath(issue: JournalIssue) {
  return journalPath(`/archive/${issue.id}`);
}

export function articlePath(articleId: string) {
  return journalPath(`/research/${articleId}`);
}

/** APA-style reference line for an article. */
export function citation(
  article: { title: string; authors: string[]; pages: string; id: string },
  issue: JournalIssue,
) {
  return `${article.authors.join(", ")} (${issue.year}). ${article.title}. ${JOURNAL.title}, ${issueNumberLabel(issue)}, ${issuePeriodLabel(issue)}, pp. ${article.pages}. ${getSiteUrl()}${articlePath(article.id)}`;
}
