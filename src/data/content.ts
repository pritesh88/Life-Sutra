/**
 * Static/mock content for Phase 1.
 * Shape mirrors the eventual API/database records so the UI can be
 * repointed at a live source without component changes.
 */

import matrutvaPaper from "@/assets/papers/emotions-foundation-reflective-enquiry-on-matrutva-bhav.docx.asset.json";
import bhavaSutraPaper from "@/assets/papers/bhav-sutra-paper-mbcc.docx.asset.json";
import tqePaper from "@/assets/papers/tqe-mindlab-conference-paper-lohar-mbcc2026.docx.asset.json";
import aeqPaper from "@/assets/papers/aeq-full-paper.docx.asset.json";
import vedantaPaper from "@/assets/papers/research-paper-on-an-integrative-vedanta-islf-framework.docx.asset.json";
import qefmPaper from "@/assets/papers/research-paper-on-a-collective-emotional-field-model-qefm.docx.asset.json";
import bccaPaper from "@/assets/papers/bhava-centric-communication-architecture.docx.asset.json";
import qesPaper from "@/assets/papers/quantum-emotional-semiconductors.docx.asset.json";

export type Paper = {
  id: string;
  title: string;
  authors: string[];
  affiliation: string;
  domain: string;
  issue: string;
  date: string;
  pages: string;
  type: "Research Article" | "Review" | "Field Study" | "Textual Study" | "Methodology Note";
  abstract: string;
  keywords: string[];
  downloadUrl?: string;
  status?: "Published" | "Submitted manuscript";
};

export type Abstract = {
  id: string;
  title: string;
  authors: string[];
  domain: string;
  date: string;
  summary: string;
  status: "Under Review" | "Accepted" | "Published";
};

export type Conference = {
  id: string;
  title: string;
  host: string;
  location: string;
  mode: "In-person" | "Hybrid" | "Online";
  dates: string;
  deadline: string;
  themes: string[];
  status: "Call for Papers" | "Registration Open" | "Archived";
};

export type Dialogue = {
  id: string;
  title: string;
  contributor: string;
  role: string;
  format: "Commentary" | "Roundtable" | "Response" | "Interview";
  date: string;
  excerpt: string;
  readingTime: string;
};

export type WhitePaper = {
  id: string;
  title: string;
  issuedBy: string;
  date: string;
  pages: number;
  theme: string;
  summary: string;
};

export type Opportunity = {
  id: string;
  title: string;
  organisation: string;
  type: "Fellowship" | "Grant" | "Doctoral Position" | "Call for Chapters" | "Residency";
  location: string;
  funding: string;
  deadline: string;
  summary: string;
};

export type Researcher = {
  id: string;
  name: string;
  title: string;
  institution: string;
  domains: string[];
  publications: number;
  focus: string;
};

export type Institution = {
  id: string;
  name: string;
  type: "University" | "Research Centre" | "Archive" | "Policy Institute";
  location: string;
  focus: string;
  collaborations: number;
};

export type MethodStage = {
  id: string;
  stage: string;
  title: string;
  description: string;
  outputs: string[];
};

export type MembershipTier = {
  id: string;
  name: string;
  audience: string;
  price: string;
  cadence: string;
  benefits: string[];
  featured?: boolean;
};

export const domains = [
  "Philosophy & Darśana",
  "Āyurveda & Life Sciences",
  "Mathematics & Astronomy",
  "Linguistics & Grammar",
  "Architecture & Vāstu",
  "Governance & Arthaśāstra",
  "Aesthetics & Nāṭyaśāstra",
  "Ecology & Agrarian Systems",
  "Metallurgy & Material Science",
  "Education & Pedagogy",
  "Music & Sound Systems",
  "Manuscript & Archival Studies",
];

export const journalStats = [
  { label: "Peer-reviewed papers", value: "486" },
  { label: "Contributing researchers", value: "1,240" },
  { label: "Partner institutions", value: "68" },
  { label: "Countries represented", value: "27" },
];

export const papers: Paper[] = [
  {
    id: "ls-ms-2026-009",
    title:
      "Quantum Emotional Semiconductors (QES): Integrating Neural Coherence, Semiconductor Physics, and Artificial Intelligence for Emotionally Embedded Computing Systems",
    authors: [
      "Amrita Trivedi",
      "Dr. Rohit Sharma",
      "Neha Satam",
      "Mahesh Sakharam Lohar",
      "Dr. Vijay Bhatkar",
    ],
    affiliation:
      "I Smart Life Foundation · IIT Mandi · Savitribai Phule Pune University · Multiversity · IIT Ropar · Atharva College of Engineering",
    domain: "Metallurgy & Material Science",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–13",
    type: "Research Article",
    abstract:
      "Quantum Emotional Semiconductors proposes embedding emotional coherence directly in computing hardware. Emotion is modelled as phase coherence across neural and physiological systems, quantified through a Real-Time Emotional Coherence Index and encoded in memristive and neuromorphic substrates as Affective Conductance across a three-layer architecture.",
    keywords: [
      "emotional semiconductors",
      "neural coherence",
      "memristors",
      "neuromorphic computing",
      "affective AI",
    ],
    downloadUrl: qesPaper.url,
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-008",
    title:
      "Bhāva-Centric Communication Architecture: Integrating Field-Based Affective Dynamics, Semiconductor Cognitive Systems, and Consciousness Frameworks for Next-Generation Human–Technology Interaction",
    authors: [
      "Roshni Pate",
      "Ajit Padmnabh",
      "Nisgendru Bhat",
      "Neha Satam",
      "Mahesh Sakharam Lohar",
      "Dr. Vijay Bhatkar",
    ],
    affiliation:
      "I Smart Life Foundation · IIT Mandi · Savitribai Phule Pune University · Multiversity · IIT Jodhpur",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–20",
    type: "Research Article",
    abstract:
      "This paper reconceptualizes Bhāva in Indian Knowledge Systems as a field-based, relational and emergent process, and proposes a five-layer communication architecture spanning biological signals, Bhāva Encoding Chips, transmission networks, a Digital Self interface and consciousness integration, formalized through Bhāva Vector Models.",
    keywords: [
      "Bhāva",
      "affective communication",
      "Rasa theory",
      "Digital Self",
      "Bhāva Vector Model",
    ],
    downloadUrl: bccaPaper.url,
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-006",
    title:
      "A Collective Emotional Field Model (QEFM): A Theoretical and Mathematical Formalization of the Theory of Collective Emotion Integrating Indian Knowledge Systems, Consciousness Science, and the Digital Self",
    authors: ["Dr. Shrikant Waghulkar", "Dr. Vinayak Chandrakant Shitole", "Dr. Swapnali Bhosale"],
    affiliation: "Arihant Institute of Business Management · Savitribai Phule Pune University",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–14",
    type: "Research Article",
    abstract:
      "The Collective Emotional Field Model reframes emotion as a field-based phenomenon emerging from consciousness, Antahkarana configuration, Samskara density, observer awareness and digital influence. The paper supplies a mathematical representation and Structural Equation Modeling pathway for empirical validation.",
    keywords: ["collective emotion", "Antahkarana", "Samskara", "Digital Self", "SEM"],
    downloadUrl: qefmPaper.url,
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-005",
    title: "From Chidābhāsa to Turīya: An Integrative Vedānta–ISLF Model of Consciousness Transformation and Sustainable Human Systems",
    authors: ["Dr. Mahesh Sakharam Lohar", "Dr. Shrikant Waghulkar", "Dr. Neha Nandkishor Satam"],
    affiliation: "I Smart Life Foundation · Mind Lab · Savitribai Phule Pune University · IIT Mandi",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–13",
    type: "Research Article",
    abstract:
      "This study connects Advaita Vedānta constructs of Tādātmya, Chidābhāsa and Sākṣī with sustainability orientation, translating them into measurable variables, a mathematical model and a Structural Equation Modeling framework for empirical study.",
    keywords: ["Vedānta", "consciousness", "Sākṣī", "sustainability", "SEM"],
    downloadUrl: vedantaPaper.url,
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-004",
    title: "Astrological Emotional Quotient (AEQ): A Probabilistic Emotional Baseline Framework",
    authors: ["I Smart Life Foundation Research Team"],
    affiliation: "I Smart Life Foundation",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–19",
    type: "Methodology Note",
    abstract:
      "The paper introduces Astrological Emotional Quotient, a proposed multidimensional measure combining six Jyotish natal-chart parameters with contemporary emotional-intelligence categories. It frames emotional predispositions probabilistically and outlines mixed-method validation against established measures.",
    keywords: ["AEQ", "emotional intelligence", "Jyotish", "psychometrics", "emotional baseline"],
    downloadUrl: aeqPaper.url,
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-003",
    title: "Theory of Quantum Emotion (TQE): An Integrative Framework Bridging Indian Knowledge Systems, Quantum Consciousness Science, and the Digital Self",
    authors: ["Dr. Mahesh Sakharam Lohar", "Dr. Neha Nandkishor Satam"],
    affiliation: "I Smart Life Foundation · Mind Lab · Savitribai Phule Pune University · IIT Mandi",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–13",
    type: "Research Article",
    abstract:
      "The Theory of Quantum Emotion proposes emotion as a field-based phenomenon arising from consciousness. It brings together Antahkarana, Spanda and Rasa with quantum-consciousness literature, introduces the AMPING methodology and examines collective consciousness and the Digital Self.",
    keywords: ["quantum emotion", "Antahkarana", "Spanda", "Digital Self", "AMPING"],
    downloadUrl: tqePaper.url,
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-002",
    title: "Bhava-Sutra: A Consciousness Architecture Model Integrating Bhakti Ontology, Emotional Intelligence, and Sustainable Ecology",
    authors: ["Neha Satama", "Mahesh Sakharam Lohar", "Dr. Laxmidhar Behar", "Dr. Vijay Bhatkar"],
    affiliation: "I Smart Life Foundation · IIT Mandi · Savitribai Phule Pune University · Multiversity",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–16",
    type: "Research Article",
    abstract:
      "Bhava-Sutra interprets Goloka as a relational architecture of emotional consciousness and develops a layered model spanning emotional generation, modulation, transmission, ecology, participation, governance and communication, with applications to leadership and sustainability.",
    keywords: ["Bhava", "Bhakti ontology", "emotional intelligence", "systems theory", "ecology"],
    downloadUrl: bhavaSutraPaper.url,
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-001",
    title: "From Vrittis to Emotional Fields: Re-examining Human Emotion through Indian Knowledge Systems and Reflective Inquiry",
    authors: ["Neha Satama", "Mahesh Sakharam Lohar", "Dr. Jayashree Suryawanshi", "Dr. Tushar Suryawanshi", "Dr. Vijay Bhatkar"],
    affiliation: "I Smart Life Foundation · IIT Mandi · Savitribai Phule Pune University · Multiversity",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–13",
    type: "Research Article",
    abstract:
      "Through Indian Knowledge Systems and reflective case inquiry, this paper proposes emotional fields as enduring orientations that influence cognition, relationships and action. A study of Matrutva develops an Emotional Field Formation framework using vrittis, samskaras and triguna dynamics.",
    keywords: ["emotional fields", "Vrittis", "Matrutva", "reflective inquiry", "consciousness"],
    downloadUrl: matrutvaPaper.url,
    status: "Submitted manuscript",
  },
];

export const abstracts: Abstract[] = [
  {
    id: "ab-2026-118",
    title: "Sthāpatya Veda Principles in Thermal Performance of Courtyard Housing",
    authors: ["Ar. Nikhil Sethi", "Dr. Farida Qureshi"],
    domain: "Architecture & Vāstu",
    date: "August 2026",
    summary:
      "Simulation of 12 courtyard typologies across three climate zones, tested against classical orientation and proportion prescriptions.",
    status: "Under Review",
  },
  {
    id: "ab-2026-115",
    title: "Oral Transmission Fidelity in Ṛgvedic Recitation Lineages",
    authors: ["Dr. Meera Ranganathan"],
    domain: "Manuscript & Archival Studies",
    date: "August 2026",
    summary:
      "Acoustic comparison of four regional pāṭha traditions to quantify divergence across accent, tempo and phoneme realisation.",
    status: "Accepted",
  },
  {
    id: "ab-2026-109",
    title: "Arthaśāstra Audit Norms and Modern Public Financial Management",
    authors: ["Prof. Gautam Sarin"],
    domain: "Governance & Arthaśāstra",
    date: "July 2026",
    summary:
      "Maps the adhyakṣa accounting apparatus onto contemporary internal-control taxonomies and identifies four transferable norms.",
    status: "Published",
  },
  {
    id: "ab-2026-104",
    title: "Millet Cropping Calendars in Sangam-Era Agrarian Texts",
    authors: ["Dr. Vasanthi Selvam", "Dr. James Corry"],
    domain: "Ecology & Agrarian Systems",
    date: "June 2026",
    summary:
      "Correlates literary cropping references with palaeoclimate proxies to evaluate resilience strategies under monsoon variability.",
    status: "Under Review",
  },
  {
    id: "ab-2026-097",
    title: "Gurukula Assessment Practices and Competency-Based Education",
    authors: ["Dr. Alok Bhargava"],
    domain: "Education & Pedagogy",
    date: "May 2026",
    summary:
      "A documentary study of assessment as continuous dialogue rather than terminal examination, with implications for curriculum design.",
    status: "Accepted",
  },
  {
    id: "ab-2026-091",
    title: "Śruti Intervals and Just Intonation: Measurement Across Five Gharānās",
    authors: ["Dr. Ananya Bose"],
    domain: "Music & Sound Systems",
    date: "April 2026",
    summary:
      "Pitch-tracking of 240 recorded phrases to test whether the 22-śruti division survives as a measurable performance practice.",
    status: "Published",
  },
];

export const conferences: Conference[] = [
  {
    id: "cf-2026-11",
    title: "Third International Congress on Indian Knowledge Systems",
    host: "Life Sutra with the Indian Institute of Advanced Study",
    location: "Shimla, India",
    mode: "Hybrid",
    dates: "12–15 November 2026",
    deadline: "31 July 2026",
    themes: ["Comparative epistemology", "Textual computation", "Knowledge policy"],
    status: "Call for Papers",
  },
  {
    id: "cf-2026-09",
    title: "Symposium on Manuscript Conservation and Digital Provenance",
    host: "Oriental Research Institute, Mysuru",
    location: "Mysuru, India",
    mode: "In-person",
    dates: "22–24 September 2026",
    deadline: "15 June 2026",
    themes: ["Conservation science", "Metadata standards", "Open archives"],
    status: "Registration Open",
  },
  {
    id: "cf-2026-06",
    title: "Colloquium on Āyurveda Research Methodology",
    host: "National Institute of Āyurveda with University of Bologna",
    location: "Online",
    mode: "Online",
    dates: "18–19 June 2026",
    deadline: "20 April 2026",
    themes: ["Trial design", "Reproducibility", "Regulatory frameworks"],
    status: "Registration Open",
  },
  {
    id: "cf-2025-12",
    title: "Workshop on Sanskrit Computational Linguistics",
    host: "IIT Bombay",
    location: "Mumbai, India",
    mode: "Hybrid",
    dates: "4–6 December 2025",
    deadline: "Closed",
    themes: ["Morphological analysis", "Corpus building", "Machine translation"],
    status: "Archived",
  },
];

export const dialogues: Dialogue[] = [
  {
    id: "dl-2026-22",
    title: "Is 'Indian Knowledge Systems' a Discipline or a Method?",
    contributor: "Prof. Ramachandra Vaidya",
    role: "Editorial Board, Life Sutra",
    format: "Commentary",
    date: "August 2026",
    excerpt:
      "The field risks becoming a container for anything historically Indian. A stricter methodological definition would cost us breadth and gain us credibility — a trade the discipline should now make.",
    readingTime: "9 min",
  },
  {
    id: "dl-2026-19",
    title: "Roundtable: What Counts as Evidence in Textual Reconstruction?",
    contributor: "Six contributors",
    role: "Cross-institutional panel",
    format: "Roundtable",
    date: "July 2026",
    excerpt:
      "Philologists, archaeologists and computational linguists debate whether manuscript stemma, material remains and statistical inference can share a single evidentiary standard.",
    readingTime: "22 min",
  },
  {
    id: "dl-2026-14",
    title: "A Response to the Standardisation Critique in Āyurveda Research",
    contributor: "Dr. Kavita Menon",
    role: "National Institute of Āyurveda",
    format: "Response",
    date: "June 2026",
    excerpt:
      "Standardisation is described as flattening classical practice. In our trials the opposite occurred: documenting variation precisely made regional preparation logics legible for the first time.",
    readingTime: "11 min",
  },
  {
    id: "dl-2026-08",
    title: "In Conversation: Building an Open Archive Without Losing Custodianship",
    contributor: "Dr. Meera Ranganathan",
    role: "Manuscript & Archival Studies",
    format: "Interview",
    date: "April 2026",
    excerpt:
      "Digitisation transfers access, not ownership. The archives that succeed are the ones that negotiate both explicitly before the first scan.",
    readingTime: "14 min",
  },
];

export const whitePapers: WhitePaper[] = [
  {
    id: "wp-2026-04",
    title: "Research Integrity Standards for Indian Knowledge Systems Scholarship",
    issuedBy: "Life Sutra Editorial Council",
    date: "July 2026",
    pages: 38,
    theme: "Research Integrity",
    summary:
      "Proposes citation, source-attribution and translation-transparency requirements for IKS publications, with a model declaration template for journals.",
  },
  {
    id: "wp-2026-02",
    title: "A National Framework for IKS Research Infrastructure",
    issuedBy: "Life Sutra Policy Working Group",
    date: "April 2026",
    pages: 52,
    theme: "Policy",
    summary:
      "Assesses gaps in archives, funding instruments and doctoral pipelines, and models three investment scenarios over a ten-year horizon.",
  },
  {
    id: "wp-2025-07",
    title: "Interoperable Metadata for Manuscript Collections",
    issuedBy: "Life Sutra with the Oriental Research Institute",
    date: "December 2025",
    pages: 44,
    theme: "Standards",
    summary:
      "A crosswalk between existing catalogue schemas and international library standards, enabling federated discovery across Indian repositories.",
  },
  {
    id: "wp-2025-05",
    title: "Evaluating Claims: A Rubric for IKS Knowledge Assertions",
    issuedBy: "Life Sutra Methodology Committee",
    date: "September 2025",
    pages: 29,
    theme: "Methodology",
    summary:
      "Separates textual, historical, experimental and interpretive claims, and specifies the evidence class required to support each.",
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "op-2026-31",
    title: "Postdoctoral Fellowship in Comparative Epistemology",
    organisation: "Institute of Advanced Study, Shimla",
    type: "Fellowship",
    location: "Shimla, India",
    funding: "₹1,08,000 / month + housing",
    deadline: "30 September 2026",
    summary:
      "Two-year appointment for scholars working across Nyāya, Mīmāṃsā and contemporary analytic epistemology.",
  },
  {
    id: "op-2026-28",
    title: "Research Grant: Digital Reconstruction of Regional Manuscript Archives",
    organisation: "Life Sutra Research Fund",
    type: "Grant",
    location: "India (multi-site)",
    funding: "Up to ₹25,00,000",
    deadline: "15 October 2026",
    summary:
      "Supports cataloguing, conservation assessment and open-metadata publication for under-documented collections.",
  },
  {
    id: "op-2026-25",
    title: "Doctoral Position: Historical Metallurgy of the Western Ghats",
    organisation: "University of Bologna with Udaipur Archaeometallurgy Unit",
    type: "Doctoral Position",
    location: "Bologna, Italy",
    funding: "Fully funded, 4 years",
    deadline: "12 August 2026",
    summary:
      "Field and laboratory work on smelting sites, with a mandatory eight-month placement in India.",
  },
  {
    id: "op-2026-21",
    title: "Call for Chapters: Governance Traditions and Modern Institutions",
    organisation: "Life Sutra Press",
    type: "Call for Chapters",
    location: "Remote",
    funding: "Honorarium provided",
    deadline: "1 September 2026",
    summary:
      "Edited volume seeking empirically grounded chapters on administrative, fiscal and legal traditions.",
  },
];

export const researchers: Researcher[] = [
  {
    id: "r-01",
    name: "Prof. Shalini Deshmukh",
    title: "Professor of Agrarian History",
    institution: "Centre for Agrarian History, Pune",
    domains: ["Ecology & Agrarian Systems", "Governance & Arthaśāstra"],
    publications: 47,
    focus: "Commons institutions, irrigation history, epigraphic sources",
  },
  {
    id: "r-02",
    name: "Dr. Rohit Nambiar",
    title: "Associate Professor of Sanskrit Studies",
    institution: "University of Hyderabad",
    domains: ["Linguistics & Grammar", "Philosophy & Darśana"],
    publications: 31,
    focus: "Navya-Nyāya semantics, formal models of verbal cognition",
  },
  {
    id: "r-03",
    name: "Dr. Kavita Menon",
    title: "Senior Scientist, Clinical Research",
    institution: "National Institute of Āyurveda",
    domains: ["Āyurveda & Life Sciences"],
    publications: 58,
    focus: "Trial methodology, reproducibility, pharmacovigilance",
  },
  {
    id: "r-04",
    name: "Prof. Latha Krishnan",
    title: "Chair, History of Mathematics",
    institution: "Kerala School Archive",
    domains: ["Mathematics & Astronomy"],
    publications: 39,
    focus: "Kerala school, proof culture, comparative historiography",
  },
  {
    id: "r-05",
    name: "Dr. Meera Ranganathan",
    title: "Head of Archival Research",
    institution: "Oriental Research Institute, Mysuru",
    domains: ["Manuscript & Archival Studies"],
    publications: 26,
    focus: "Oral transmission, conservation science, digital provenance",
  },
  {
    id: "r-06",
    name: "Dr. Marc Vandenberg",
    title: "Lecturer in South Asian Studies",
    institution: "Leiden University",
    domains: ["Aesthetics & Nāṭyaśāstra"],
    publications: 18,
    focus: "Performance reconstruction, iconography, digital humanities",
  },
];

export const institutions: Institution[] = [
  {
    id: "i-01",
    name: "Indian Institute of Advanced Study",
    type: "Research Centre",
    location: "Shimla, India",
    focus: "Interdisciplinary fellowships across humanities and social sciences",
    collaborations: 14,
  },
  {
    id: "i-02",
    name: "Oriental Research Institute",
    type: "Archive",
    location: "Mysuru, India",
    focus: "Manuscript conservation, cataloguing and digital provenance",
    collaborations: 11,
  },
  {
    id: "i-03",
    name: "National Institute of Āyurveda",
    type: "University",
    location: "Jaipur, India",
    focus: "Clinical research methodology and classical pharmacology",
    collaborations: 9,
  },
  {
    id: "i-04",
    name: "Leiden University — South Asian Studies",
    type: "University",
    location: "Leiden, Netherlands",
    focus: "Philology, performance studies and comparative aesthetics",
    collaborations: 7,
  },
  {
    id: "i-05",
    name: "Centre for Agrarian History",
    type: "Research Centre",
    location: "Pune, India",
    focus: "Environmental history, commons governance, field archives",
    collaborations: 6,
  },
  {
    id: "i-06",
    name: "Council for Knowledge Policy",
    type: "Policy Institute",
    location: "New Delhi, India",
    focus: "Research infrastructure, funding design and evaluation",
    collaborations: 5,
  },
];

export const methodStages: MethodStage[] = [
  {
    id: "m-1",
    stage: "01",
    title: "Source Identification",
    description:
      "Establish the textual, material or field base of the study, including manuscript recension, edition history and known lacunae.",
    outputs: ["Source register", "Recension note", "Provenance statement"],
  },
  {
    id: "m-2",
    stage: "02",
    title: "Claim Formulation",
    description:
      "State the knowledge claim precisely and classify it as textual, historical, experimental or interpretive before evidence is gathered.",
    outputs: ["Claim statement", "Claim classification", "Falsifiability note"],
  },
  {
    id: "m-3",
    stage: "03",
    title: "Evidence Design",
    description:
      "Match the evidence class to the claim class, specifying instruments, sampling, corpora or comparative controls in advance.",
    outputs: ["Protocol", "Instrument list", "Pre-registration"],
  },
  {
    id: "m-4",
    stage: "04",
    title: "Translation Transparency",
    description:
      "Document every interpretive decision where a technical term is rendered into a modern analytic vocabulary.",
    outputs: ["Glossary", "Translation log", "Alternative readings"],
  },
  {
    id: "m-5",
    stage: "05",
    title: "Peer Review",
    description:
      "Double-anonymous review by one domain specialist and one methodological reviewer, with a public summary of the review basis.",
    outputs: ["Reviewer reports", "Revision record", "Decision letter"],
  },
  {
    id: "m-6",
    stage: "06",
    title: "Synthesis & Deposit",
    description:
      "Link the accepted study into the wider corpus, deposit data where permitted, and register the contribution in the observatory.",
    outputs: ["Linked record", "Data deposit", "Impact entry"],
  },
];

export const membershipTiers: MembershipTier[] = [
  {
    id: "t-1",
    name: "Reader",
    audience: "Students and independent scholars",
    price: "Free",
    cadence: "",
    benefits: [
      "Full access to published abstracts",
      "Quarterly journal digest",
      "Conference announcements",
      "IKS Dialogue archive",
    ],
  },
  {
    id: "t-2",
    name: "Researcher",
    audience: "Active academics and doctoral candidates",
    price: "₹4,800",
    cadence: "per year",
    benefits: [
      "Everything in Reader",
      "Full-text access to all papers",
      "Submission fee waiver (two per year)",
      "Researcher profile in the directory",
      "Priority conference registration",
    ],
    featured: true,
  },
  {
    id: "t-3",
    name: "Institution",
    audience: "Universities, centres and archives",
    price: "₹1,20,000",
    cadence: "per year",
    benefits: [
      "Campus-wide full-text access",
      "Institutional profile and researcher roster",
      "Co-hosting rights for symposia",
      "Access to the research observatory dataset",
      "Named editorial liaison",
    ],
  },
];

export const editorialPrinciples = [
  {
    title: "Evidence before assertion",
    body: "Every knowledge claim is classified and matched to an evidence standard before it enters review. Tradition is a source, not a substitute for argument.",
  },
  {
    title: "Transparent translation",
    body: "Technical vocabulary carries interpretive weight. Authors document each rendering decision so readers can reconstruct the reasoning.",
  },
  {
    title: "Comparative but not derivative",
    body: "Indian frameworks are examined on their own terms first, then placed in comparison — never validated only by resemblance to modern categories.",
  },
  {
    title: "Open by default",
    body: "Abstracts, metadata and review summaries are public. Data is deposited wherever custodianship agreements permit.",
  },
];

export const synthesisThreads = [
  {
    title: "Water commons across three centuries",
    linked: "18 studies · 4 domains",
    body: "Field surveys, inscriptions and policy analyses converging on the institutional design of shared irrigation.",
  },
  {
    title: "Formalising classical semantics",
    linked: "11 studies · 2 domains",
    body: "Navya-Nyāya, Pāṇinian grammar and computational linguistics read as a single research programme.",
  },
  {
    title: "Reproducibility in classical medicine",
    linked: "23 studies · 3 domains",
    body: "Preparation standards, trial protocols and regulatory pathways assessed as one evidence chain.",
  },
];
