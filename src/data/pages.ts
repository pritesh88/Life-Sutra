import { journalPath } from "@/lib/routes";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const homeMeta: Metadata = pageMeta({
  title: "Home",
  absoluteTitle: "Life Sutra Synthesis — Discover, Research, Synthesize, Connect",
  description:
    "Life Sutra Synthesis is a scholarly research publication for Indian Knowledge Systems, connecting research, knowledge, methodology and researchers.",
  path: journalPath(),
  ogTitle: "Life Sutra Synthesis — Discover, Research, Synthesize, Connect",
});

export const aboutMeta: Metadata = pageMeta({
  title: "About",
  description:
    "Life Sutra Synthesis's mission, editorial standards, review process and governance for Indian Knowledge Systems research.",
  path: journalPath("/about"),
  ogTitle: "About Life Sutra Synthesis",
});

export const researchMeta: Metadata = pageMeta({
  title: "Research Publications",
  description:
    "Peer-reviewed research publications on Indian Knowledge Systems: textual studies, field studies, reviews and methodology notes.",
  path: journalPath("/research"),
});

export const abstractsMeta: Metadata = pageMeta({
  title: "Research Abstracts",
  description:
    "Research Abstracts is in preparation. Submissions will be indexed here as they clear desk review.",
  path: journalPath("/research-abstracts"),
});

export const conferencesMeta: Metadata = pageMeta({
  title: "Conferences & Calls for Papers",
  description:
    "Conferences and calls for papers on Indian Knowledge Systems is in preparation — listings will appear here as they are confirmed.",
  path: journalPath("/conferences"),
});

export const dialogueMeta: Metadata = pageMeta({
  title: "IKS Dialogue",
  description:
    "IKS Dialogue, a moderated space for commentary and debate on Indian Knowledge Systems research, is in preparation.",
  path: journalPath("/iks-dialogue"),
});

export const whitePapersMeta: Metadata = pageMeta({
  title: "White Papers",
  description:
    "Life Sutra Synthesis white papers on research integrity, metadata standards and policy frameworks are in preparation.",
  path: journalPath("/white-papers"),
});

export const opportunitiesMeta: Metadata = pageMeta({
  title: "Research Opportunities",
  description:
    "Fellowships, grants, doctoral positions and calls for chapters in Indian Knowledge Systems research — this listing is in preparation.",
  path: journalPath("/research-opportunities"),
});

export const methodologyMeta: Metadata = pageMeta({
  title: "Research Methodology",
  description:
    "The Life Sutra Synthesis methodology framework and editorial principles for Indian Knowledge Systems research.",
  path: journalPath("/methodology"),
});

export const researchersMeta: Metadata = pageMeta({
  title: "Researcher Directory",
  description:
    "A directory of scholars publishing Indian Knowledge Systems research with Life Sutra Synthesis is in preparation.",
  path: journalPath("/researchers"),
});

export const institutionsMeta: Metadata = pageMeta({
  title: "Partner Institutions",
  description:
    "A directory of universities, research centres, archives and policy institutes collaborating with Life Sutra Synthesis is in preparation.",
  path: journalPath("/institutions"),
});

export const impactMeta: Metadata = pageMeta({
  title: "Research Impact & Observatory",
  description:
    "The planned Life Sutra Synthesis research observatory for measuring progress in Indian Knowledge Systems scholarship.",
  path: journalPath("/research-impact"),
});

export const submitMeta: Metadata = pageMeta({
  title: "Submit Research",
  description:
    "Submission requirements, review timeline and author guidance for publishing Indian Knowledge Systems research with Life Sutra Synthesis.",
  path: "/submit-research",
});

export const membershipMeta: Metadata = pageMeta({
  title: "Membership",
  description:
    "Reader, researcher and institutional membership options for the Life Sutra Synthesis Indian Knowledge Systems research community.",
  path: "/membership",
});

export const homeContent = {
  ecosystem: [
    {
      step: "01",
      title: "Research",
      body: "Peer-reviewed studies across textual, field, experimental and computational methods.",
    },
    {
      step: "02",
      title: "Knowledge",
      body: "Traditional knowledge claims documented, described and made investigable.",
    },
    {
      step: "03",
      title: "Methodology",
      body: "Plural, pramāṇa-sensitive approaches matched to the nature of each claim.",
    },
    {
      step: "04",
      title: "Researchers",
      body: "Scholars working across disciplines, languages and regions.",
    },
    {
      step: "05",
      title: "Institutions",
      body: "Universities, archives, centres and policy bodies collaborating on shared infrastructure.",
    },
    {
      step: "06",
      title: "Synthesis",
      body: "Findings linked into threads so evidence accumulates instead of scattering.",
    },
  ],
  knowledgeModel: [
    {
      label: "Knowledge Claim",
      body: "A statement drawn from a text, a lineage or a living practice, recorded precisely and with its source.",
    },
    {
      label: "Evidence",
      body: "Textual, historical, empirical or experimental material that can support, qualify or contest the claim.",
    },
    {
      label: "Research",
      body: "A study designed around the claim, with a method appropriate to the kind of evidence available.",
    },
    {
      label: "Synthesis",
      body: "Related studies read together, so that the state of the question becomes visible.",
    },
  ],
  incubatorPath: [
    "Idea",
    "White paper",
    "Researcher matching",
    "Methodology",
    "Research",
    "Conference",
    "Publication",
    "Synthesis",
  ],
  trustItems: [
    "Double-anonymous external peer review",
    "Open access",
    "Methodological transparency",
    "Evidence distinction",
    "Editorial independence",
  ],
} as const;

export const aboutRoadmap = [
  {
    phase: "Now",
    title: "Peer-reviewed e-journal",
    body: "Quarterly issues, open abstracts, white papers and a public methodology framework.",
  },
  {
    phase: "Next",
    title: "Connected research records",
    body: "Researchers, institutions, conferences and studies linked as a single queryable corpus.",
  },
  {
    phase: "Later",
    title: "Research observatory",
    body: "Synthesis threads, evidence chains and indicators that measure how the field is progressing.",
  },
] as const;

export const submitContent = {
  timeline: [
    {
      step: "Desk review",
      detail: "Within 3 weeks",
      body: "Scope, claim clarity and source register checked by an editor.",
    },
    {
      step: "Full review",
      detail: "Within 10 weeks",
      body: "One domain specialist and one methodological reviewer, double-anonymous.",
    },
    {
      step: "Revision",
      detail: "4–8 weeks",
      body: "Point-by-point response required; second round where reviewers request it.",
    },
    {
      step: "Publication",
      detail: "Next issue",
      body: "Abstract indexed on acceptance; full text at issue release.",
    },
  ],
  requirements: [
    "6,000–12,000 words including notes, or 3,000 for a methodology note",
    "Declared claim class and matching evidence design",
    "Source register with recension and edition details",
    "Glossary for every technical term rendered into English",
    "Anonymised manuscript plus a separate title page",
    "Data or field notes deposited where custodianship permits",
  ],
} as const;

export const membershipFaqs = [
  {
    q: "Is peer review affected by membership?",
    a: "No. Review is double-anonymous and reviewers never see membership status. Members receive fee waivers, not editorial advantage.",
  },
  {
    q: "Can students join at the researcher tier?",
    a: "Doctoral candidates qualify for the researcher tier at half the listed rate on verification of enrolment.",
  },
  {
    q: "What does institutional access include?",
    a: "Campus-wide full-text access, an institutional profile with a researcher roster, and access to the observatory dataset once it is built.",
  },
] as const;

export const impactContent = {
  observatory: [
    {
      title: "Evidence chains",
      body: "Each claim links to the studies that support, qualify or contest it, so strength is visible rather than asserted.",
    },
    {
      title: "Coverage mapping",
      body: "Domains and regions are tracked against source availability, surfacing where scholarship is thin.",
    },
    {
      title: "Method adoption",
      body: "Uptake of protocol stages is measured across publications to see whether standards are actually changing practice.",
    },
  ],
} as const;
