/**
 * Static/mock content for Phase 1.
 * Shape mirrors the eventual API/database records so the UI can be
 * repointed at a live source without component changes.
 */

const paperUrl = (filename: string) => `/research-papers/${encodeURIComponent(filename)}`;

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
  /**
   * Per-author institution/bio, once supplied. Not populated today — only a
   * combined `affiliation` string exists per paper — so this stays optional
   * and unused rather than guessing which author belongs to which institution.
   */
  authorDetails?: { name: string; affiliation?: string; bio?: string }[];
};

export type EditorialBoardMember = {
  id: string;
  name: string;
  editorialDesignation: string;
  organization: string;
  academicDesignation?: string;
  email?: string;
  linkedin?: string;
  website?: string;
  photo: string;
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
    downloadUrl: paperUrl("quantum-emotional-semiconductors.pdf"),
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
    downloadUrl: paperUrl("bhava-centric-communication-architecture.pdf"),
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
    downloadUrl: paperUrl("collective-emotional-field-model-qefm.pdf"),
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-005",
    title:
      "From Chidābhāsa to Turīya: An Integrative Vedānta–ISLF Model of Consciousness Transformation and Sustainable Human Systems",
    authors: ["Dr. Mahesh Sakharam Lohar", "Dr. Shrikant Waghulkar", "Dr. Neha Nandkishor Satam"],
    affiliation:
      "I Smart Life Foundation · Mind Lab · Savitribai Phule Pune University · IIT Mandi",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–13",
    type: "Research Article",
    abstract:
      "This study connects Advaita Vedānta constructs of Tādātmya, Chidābhāsa and Sākṣī with sustainability orientation, translating them into measurable variables, a mathematical model and a Structural Equation Modeling framework for empirical study.",
    keywords: ["Vedānta", "consciousness", "Sākṣī", "sustainability", "SEM"],
    downloadUrl: paperUrl("integrative-vedanta-islf-framework.pdf"),
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
    downloadUrl: paperUrl("astrological-emotional-quotient-aeq.pdf"),
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-003",
    title:
      "Theory of Quantum Emotion (TQE): An Integrative Framework Bridging Indian Knowledge Systems, Quantum Consciousness Science, and the Digital Self",
    authors: ["Dr. Mahesh Sakharam Lohar", "Dr. Neha Nandkishor Satam"],
    affiliation:
      "I Smart Life Foundation · Mind Lab · Savitribai Phule Pune University · IIT Mandi",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–13",
    type: "Research Article",
    abstract:
      "The Theory of Quantum Emotion proposes emotion as a field-based phenomenon arising from consciousness. It brings together Antahkarana, Spanda and Rasa with quantum-consciousness literature, introduces the AMPING methodology and examines collective consciousness and the Digital Self.",
    keywords: ["quantum emotion", "Antahkarana", "Spanda", "Digital Self", "AMPING"],
    downloadUrl: paperUrl("theory-of-quantum-emotion-tqe.pdf"),
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-002",
    title:
      "Bhava-Sutra: A Consciousness Architecture Model Integrating Bhakti Ontology, Emotional Intelligence, and Sustainable Ecology",
    authors: ["Neha Satama", "Mahesh Sakharam Lohar", "Dr. Laxmidhar Behar", "Dr. Vijay Bhatkar"],
    affiliation:
      "I Smart Life Foundation · IIT Mandi · Savitribai Phule Pune University · Multiversity",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–16",
    type: "Research Article",
    abstract:
      "Bhava-Sutra interprets Goloka as a relational architecture of emotional consciousness and develops a layered model spanning emotional generation, modulation, transmission, ecology, participation, governance and communication, with applications to leadership and sustainability.",
    keywords: ["Bhava", "Bhakti ontology", "emotional intelligence", "systems theory", "ecology"],
    downloadUrl: paperUrl("bhava-sutra.pdf"),
    status: "Submitted manuscript",
  },
  {
    id: "ls-ms-2026-001",
    title:
      "From Vrittis to Emotional Fields: Re-examining Human Emotion through Indian Knowledge Systems and Reflective Inquiry",
    authors: [
      "Neha Satama",
      "Mahesh Sakharam Lohar",
      "Dr. Jayashree Suryawanshi",
      "Dr. Tushar Suryawanshi",
      "Dr. Vijay Bhatkar",
    ],
    affiliation:
      "I Smart Life Foundation · IIT Mandi · Savitribai Phule Pune University · Multiversity",
    domain: "Philosophy & Darśana",
    issue: "Submitted Research · 2026",
    date: "2026",
    pages: "1–13",
    type: "Research Article",
    abstract:
      "Through Indian Knowledge Systems and reflective case inquiry, this paper proposes emotional fields as enduring orientations that influence cognition, relationships and action. A study of Matrutva develops an Emotional Field Formation framework using vrittis, samskaras and triguna dynamics.",
    keywords: ["emotional fields", "Vrittis", "Matrutva", "reflective inquiry", "consciousness"],
    downloadUrl: paperUrl("from-vrittis-to-emotional-fields.pdf"),
    status: "Submitted manuscript",
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

export const editorialBoard: EditorialBoardMember[] = [
  {
    id: "eb-lohar",
    name: "Dr. Mahesh Lohar",
    editorialDesignation: "Chief Editor",
    organization: "I Smart Life Foundation",
    academicDesignation: "Founder, Consciousness Scientist",
    email: "ismart@manasyog.com",
    linkedin: "https://www.linkedin.com/in/dr-mahesh-lohar-316407a/",
    website: "https://manasyog.life/#absolute",
    photo: "/assets/editorial/mahesh-lohar.jpg",
  },
  {
    id: "eb-waghulkar",
    name: "Dr. Shrikant Waghulkar",
    editorialDesignation: "Editorial Board Member",
    organization: "Arihant Institute of Business Management, Pune",
    academicDesignation: "Associate Professor",
    email: "shrikant@arihantacs.edu.in",
    linkedin: "https://www.linkedin.com/in/drshrikantwaghulkar/",
    photo: "/assets/editorial/shrikant-waghulkar.jpg",
  },
  {
    id: "eb-dadas",
    name: "Dr. Anand B. Dadas",
    editorialDesignation: "Editorial Board Member",
    organization: "Neville Wadia Institute of Management Studies and Research, Pune",
    academicDesignation: "Director and Professor",
    email: "director@newillewadia.com",
    linkedin: "https://www.linkedin.com/in/dr-anandrao-dadas-b0499b1b/",
    photo: "/assets/editorial/anand-dadas.jpg",
  },
  {
    id: "eb-shitole",
    name: "Dr. Vinayak Shitole",
    editorialDesignation: "Editorial Board Member",
    organization: "Arihant Institute of Business Management, Pune",
    academicDesignation: "Assistant Professor",
    email: "vinayak@arihantacs.edu.in",
    linkedin: "https://www.linkedin.com/in/vinayak-shitole/",
    photo: "/assets/editorial/vinayak-shitole.jpg",
  },
  {
    id: "eb-shinde",
    name: "Dr. Santosh M. Shinde",
    editorialDesignation: "Editorial Board Member",
    organization: "PCET's S. B. Patil Institute of Management, Akurdi, Pune",
    academicDesignation: "Assistant Professor",
    email: "santoshshinde@sbpatilmba.com",
    linkedin: "https://www.linkedin.com/in/santosh-shinde-31a43419/",
    website: "https://www.sbpatilmba.com/dr-santosh-shinde-details.php",
    photo: "/assets/editorial/santosh-shinde.jpg",
  },
  {
    id: "eb-pawar",
    name: "Dr. Dileep Madhukar Pawar",
    editorialDesignation: "Editorial Board Member",
    organization: "PCET's S.B. Patil Institute of Management Pune",
    academicDesignation: "Assistant Professor",
    email: "dileep.pawar@sbpatilmba.com",
    linkedin: "https://www.linkedin.com/in/dr-dileep-pawar-206a2769/",
    photo: "/assets/editorial/dileep-pawar.jpg",
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
