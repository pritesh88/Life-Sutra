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
  issn: "To Be Issued",
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

/**
 * About, Aims & Scope, author guidelines and policies — shown on the journal's
 * main page, as ISSN India asks. Wording reuses what the journal already says
 * on its About and Submit pages; the plagiarism policy follows the UGC
 * (Promotion of Academic Integrity and Prevention of Plagiarism in Higher
 * Educational Institutions) Regulations, 2018, which ISSN India refers to.
 */
export const JOURNAL_ABOUT =
  "Life Sutra Synthesis is a scholarly, peer-reviewed online journal of mind, consciousness studies and Indian Knowledge Systems (IKS), published by I Smart Life Foundation. It publishes rigorous interdisciplinary research that documents knowledge claims from Indian intellectual traditions precisely and examines them with methods appropriate to the kind of evidence available.";

export const JOURNAL_AIMS = [
  "Publish original, peer-reviewed research on Indian Knowledge Systems and on mind, emotion and consciousness studies.",
  "Bring traditional knowledge claims into dialogue with contemporary science through clearly stated, evidence-appropriate methods.",
  "Connect studies, methods and researchers so that findings accumulate into a shared, searchable body of evidence.",
  "Hold every study to transparent reasoning, open methodology and contemporary scholarly standards.",
];

/** Subject areas the journal accepts. */
export const JOURNAL_SCOPE = [
  "Mind, emotion & consciousness studies",
  "Philosophy & Darśana",
  "Āyurveda & life sciences",
  "Mathematics & astronomy",
  "Linguistics & grammar",
  "Architecture & Vāstu",
  "Governance & Arthaśāstra",
  "Aesthetics & Nāṭyaśāstra",
  "Ecology & agrarian systems",
  "Metallurgy & material science",
  "Education & pedagogy",
  "Music & sound systems",
  "Manuscript & archival studies",
];

export const JOURNAL_GUIDELINES = [
  "Original, unpublished work not under review elsewhere.",
  "6,000–12,000 words including notes, or 3,000 words for a methodology note.",
  "A declared knowledge-claim class with a matching evidence design.",
  "A source register with recension and edition details, and a glossary for technical terms rendered into English.",
  "An anonymised manuscript plus a separate title page with author names, affiliations and institutional email addresses.",
  "References in a consistent academic style (APA preferred).",
];

export const JOURNAL_POLICIES = [
  {
    title: "Peer review",
    body: "Double-anonymous review. After desk review (within 3 weeks), each manuscript is read by one domain specialist and one methodological reviewer (within 10 weeks); revisions require a point-by-point response.",
  },
  {
    title: "Plagiarism",
    body: "Every manuscript is checked for similarity before review, and cases are handled in line with the UGC (Promotion of Academic Integrity and Prevention of Plagiarism in Higher Educational Institutions) Regulations, 2018. Plagiarised or previously published work is rejected.",
  },
  {
    title: "Open access & licence",
    body: `Articles are published open access under the ${JOURNAL.license} licence, with each article available as a separate PDF.`,
  },
  {
    title: "Publication ethics",
    body: "Authors must disclose funding and conflicts of interest and confirm the originality of their work; editors and reviewers keep manuscripts confidential.",
  },
];
