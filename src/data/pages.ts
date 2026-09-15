import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const homeMeta: Metadata = pageMeta({
  title: "Home",
  absoluteTitle: "Life Sutra — Discover, Research, Synthesize, Connect",
  description:
    "Life Sutra is a global scholarly research and knowledge platform for Indian Knowledge Systems, connecting research, knowledge, methodology, researchers, institutions and synthesis.",
  path: "/",
  ogTitle: "Life Sutra — Discover, Research, Synthesize, Connect",
});

export const aboutMeta: Metadata = pageMeta({
  title: "About",
  description:
    "Life Sutra's mission, editorial standards, review process and governance for Indian Knowledge Systems research.",
  path: "/about",
  ogTitle: "About Life Sutra",
});

export const researchMeta: Metadata = pageMeta({
  title: "Research Papers",
  description:
    "Peer-reviewed research papers on Indian Knowledge Systems: textual studies, field studies, reviews and methodology notes.",
  path: "/research",
});

export const abstractsMeta: Metadata = pageMeta({
  title: "Research Abstracts",
  description:
    "Openly indexed abstracts of Indian Knowledge Systems research under review, accepted and published at Life Sutra.",
  path: "/research-abstracts",
});

export const conferencesMeta: Metadata = pageMeta({
  title: "Conferences & Calls for Papers",
  description:
    "Congresses, symposia and methodology colloquia on Indian Knowledge Systems, with calls for papers and registration details.",
  path: "/conferences",
});

export const dialogueMeta: Metadata = pageMeta({
  title: "IKS Dialogue",
  description:
    "Commentary, responses, interviews and roundtables debating methods and evidence standards in Indian Knowledge Systems research.",
  path: "/iks-dialogue",
});

export const whitePapersMeta: Metadata = pageMeta({
  title: "White Papers",
  description:
    "Life Sutra white papers on research integrity, metadata standards, policy frameworks and evidence rubrics for Indian Knowledge Systems.",
  path: "/white-papers",
});

export const opportunitiesMeta: Metadata = pageMeta({
  title: "Research Opportunities",
  description:
    "Fellowships, grants, doctoral positions and calls for chapters in Indian Knowledge Systems research, with funding and deadline details.",
  path: "/research-opportunities",
});

export const methodologyMeta: Metadata = pageMeta({
  title: "Research Methodology",
  description:
    "The Life Sutra methodology framework: source identification, claim classification, evidence design, translation transparency, peer review and synthesis.",
  path: "/methodology",
});

export const researchersMeta: Metadata = pageMeta({
  title: "Researcher Directory",
  description:
    "Directory of scholars publishing Indian Knowledge Systems research with Life Sutra, listed by domain, institution and research focus.",
  path: "/researchers",
});

export const institutionsMeta: Metadata = pageMeta({
  title: "Partner Institutions",
  description:
    "Universities, research centres, archives and policy institutes collaborating with Life Sutra on Indian Knowledge Systems research.",
  path: "/institutions",
});

export const impactMeta: Metadata = pageMeta({
  title: "Research Impact & Observatory",
  description:
    "Indicators, synthesis threads and the planned Life Sutra research observatory for measuring progress in Indian Knowledge Systems scholarship.",
  path: "/research-impact",
});

export const submitMeta: Metadata = pageMeta({
  title: "Submit Research",
  description:
    "Submission requirements, review timeline and author guidance for publishing Indian Knowledge Systems research with Life Sutra.",
  path: "/submit-research",
});

export const membershipMeta: Metadata = pageMeta({
  title: "Membership",
  description:
    "Reader, researcher and institutional membership options for the Life Sutra Indian Knowledge Systems research community.",
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
  observatoryMetrics: [
    { label: "Researchers", value: "1,240" },
    { label: "Institutions", value: "68" },
    { label: "Projects", value: "94" },
    { label: "Publications", value: "486" },
    { label: "Conferences", value: "31" },
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

export const claimClasses = [
  {
    name: "Textual",
    body: "What a source says. Requires recension detail, variant readings and a translation log.",
  },
  {
    name: "Historical",
    body: "What happened. Requires dated material, epigraphic or archival corroboration.",
  },
  {
    name: "Experimental",
    body: "What can be reproduced. Requires protocol, sample description and pre-registration.",
  },
  {
    name: "Interpretive",
    body: "What a source means for us now. Requires explicit framework and stated alternatives.",
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
    a: "Campus-wide full-text access, an institutional profile with a researcher roster, and access to the observatory dataset.",
  },
] as const;

export const impactContent = {
  indicators: [
    { label: "Citations recorded", value: "3,180" },
    { label: "Cross-domain studies", value: "112" },
    { label: "Datasets deposited", value: "74" },
    { label: "Policy references", value: "23" },
  ],
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
