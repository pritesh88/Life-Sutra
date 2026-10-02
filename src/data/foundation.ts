/**
 * I Smart Life Foundation (ISLF) — the publisher. Single source for the
 * foundation's identity, contact details and the publications it issues.
 *
 * Contact details come from the foundation's existing website. Anything not
 * yet verified is left as null and rendered as "to be confirmed" — do not
 * fill these in with guesses.
 */
import { IMPRINT_BASE, JOURNAL_BASE } from "@/lib/routes";

export const FOUNDATION = {
  name: "I Smart Life Foundation",
  shortName: "ISLF",
  country: "India",
  /** How the foundation is named as a publishing body (ISSN form wording). */
  publishingBody: "I Smart Life Foundation (ISLF), India",
  legalForm: "Section 8 company",
  /** Owner and founder of the publishing body. */
  owner: "Dr. Mahesh Lohar",
  tagline: "Synthesising Work, Life and Consciousness.",
  /** What the foundation is, in its own words (shown under the name on the homepage). */
  descriptor:
    "Mind Cognition Intellect and Consciousness IKS integrating Study, Research Discussions and Publication Body",
  summary:
    "An interdisciplinary foundation exploring the intersections of Indian Knowledge Systems, scientific inquiry, conscious living, human development, and sustainability.",
  mahavakya: {
    transliteration: "Ayam Atma Brahma",
    translation: "This Self is Brahman.",
    source: "Upanishadic Mahavakya",
  },
  website: "https://lifesutra.co.in",
  /** The foundation's own website; the foundation's name links here. */
  legacyWebsite: "https://manasyog.life/",
  contact: {
    person: "Mahesh Lohar",
    designation: "Principal Integrator",
    /** I Smart Life Foundation (publisher) email. */
    email: "drmahesh@manasyog.life",
    phone: "+91 9422770563",
    /** tel: href form of `phone`. */
    phoneHref: "tel:+919422770563",
    locality: "Aundh, Pune, India",
    /** Full registered address, as supplied by the foundation. */
    registeredAddress: "4, Sanjog 1, Aundh, Pune 411007, Maharashtra, India" as string | null,
  },
  /** Year of incorporation — not yet verified. Not the same as any journal's starting year. */
  incorporated: null as number | null,
} as const;

export const TO_BE_CONFIRMED = "To be confirmed";

/** "Aundh, Pune, India" until the full registered address is supplied. */
export function foundationAddress() {
  return FOUNDATION.contact.registeredAddress ?? FOUNDATION.contact.locality;
}

/* ---------- Foundation narrative ----------
 * Wording follows the foundation's own site (manasyog.life), lightly edited
 * for spelling and consistency. Keep it that way: no invented claims.
 */

export const aboutParagraphs = [
  "I Smart Life Foundation is a Section 8 company founded on the Upanishadic Mahavakya Ayam Atma Brahma — “This Self is Brahman.”",
  "The foundation seeks to integrate consciousness and mind synthesis into everyday life through research projects, workshops, and educational initiatives that encourage self-exploration, work-life balance, and self-realization.",
  "It brings together traditional knowledge and contemporary inquiry, working toward human well-being, sustainability, universal harmony, and responsible development.",
];

export const aboutFacts = [
  { label: "Constituted as", value: "Section 8 company" },
  { label: "Founding principle", value: "Ayam Atma Brahma" },
  { label: "Based in", value: "Aundh, Pune, India" },
  { label: "Publishing body for", value: "Life Sutra Synthesis · Life Sutra" },
];

/** The founding Mahavakya, explained as on the foundation's site. */
export const mahavakyaExplained = {
  heading: "Ayam Atma Brahma: Self is Absolute",
  meaning:
    "The Sanskrit term Ayam means ‘this’. Atma refers to Atman, the Self. Brahma is Brahman, the Supreme Entity. Hence Ayam Atma Brahma means ‘Atman is Brahman’.",
  atman:
    "Atman is that which is other than the gross, subtle and causal bodies; which is beyond the five sheaths — Annamaya, Pranamaya, Manomaya, Vijnanamaya and Anandamaya Kosha; which witnesses the three states of consciousness — Jagrat, Svapna and Sushupti; and which is of the nature of Existence–Consciousness–Bliss. This Atman is Brahman.",
  attribution: "Swami Shivanand",
};

/**
 * Vision themes, grouped into the three strands they connect. Grouping is
 * editorial; the themes themselves are the foundation's own.
 */
export const visionStrands = [
  {
    strand: "Inquiry",
    themes: [
      "Synthesising research on spirituality and science.",
      "Exploring consciousness through a mind-mapping digital laboratory.",
      "Developing research-based self-exploration initiatives.",
    ],
  },
  {
    strand: "Society",
    themes: [
      "Advancing understanding of humanity and society.",
      "Encouraging sustainable organizational leadership.",
      "Vishwamitra Industry 6.0 — guiding organizations from Industry 4.0 toward Industry 6.0.",
    ],
  },
  {
    strand: "The individual",
    themes: [
      "Supporting mind management and work-life-consciousness integration.",
      "Promoting cognitive development, cognitive seeding and conscious living.",
    ],
  },
];

export const missionAreas = [
  {
    title: "Human Well-being",
    body: "Promoting holistic development, self-awareness, purposeful living, and individual well-being.",
  },
  {
    title: "Research and Knowledge Integration",
    body: "Bringing Indian Knowledge Systems, contemporary science, and interdisciplinary research into meaningful dialogue.",
  },
  {
    title: "Sustainable Development",
    body: "Encouraging sustainable practices, green habitats, environmental responsibility, and net-zero initiatives.",
  },
  {
    title: "Conscious Leadership",
    body: "Supporting organizational awareness, responsible governance, and work-life-consciousness management.",
  },
  {
    title: "Education and Human Development",
    body: "Developing learning experiences that integrate traditional knowledge, modern inquiry, cognitive development, and practical application.",
  },
  {
    title: "Collaboration and Knowledge Exchange",
    body: "Encouraging partnerships among institutions, researchers, communities, and individuals.",
  },
];

/** The programmes through which the mission is carried out (from the foundation's site). */
export const missionProgrammes = [
  {
    title: "Human Wellbeing",
    body: "Morality, devotion, duty and holistic wellness, including Garbha Sanskar.",
  },
  {
    title: "The OneWorld",
    body: "An intelligence and talent-exchange digital platform, with the Sustain Sages YouTube channel.",
  },
  {
    title: "Sustainable Harmonious Governance",
    body: "Conscious seeding to net zero, organizational consciousness, and UN SDG, ESG and EE certification programmes.",
  },
  {
    title: "I Smart Leaders",
    body: "Self-realization, Manas Yog, work-life balance and a consciousness-coach training programme.",
  },
  {
    title: "Self Synthesis",
    body: "The Life Niti app for self-development, personality, career, health, lifestyle, relationships and emotional management.",
  },
  {
    title: "Co-Existence",
    body: "Kamdhenu, Tulasi, Nakshatra, Yagna, rural talent and farming skills for sustainable citizenship, and the Dr Vijay Bhatkar Cognitive Development Study Centre.",
  },
];

export const cultureParagraphs = [
  "Our culture is rooted in admiration for the richness of Indian Knowledge Systems and the celebration of human diversity.",
  "We respect the unique traditions, values, and knowledge systems of different cultures while recognizing our shared commitment to harmony, conscious living, and sustainability.",
  "We believe diversity strengthens unity and that collaboration across disciplines and cultures can contribute to a more peaceful and sustainable world.",
];

/** Introduction to the approach, from the foundation's Green Habitat page. */
export const approachIntro =
  "We aim to foster a conscious, sustainable world by integrating nature’s spirit with scientific innovation — through green habitat development, holistic life practices and transformative education, guiding individuals, organizations and communities from Industry 4.0 to Industry 6.0. Our approach builds on over 30 years of expertise in net-zero strategies and sustainable growth.";

export const pillars = [
  {
    key: "work",
    word: "Work",
    title: "Green Habitat",
    body: "We develop sustainable environments through green initiatives, energy and green audits, and eco-friendly infrastructure, working towards net-zero environmental impact.",
    points: ["Green initiatives", "Energy & green audits", "Eco-friendly infrastructure"],
    image: "greenHabitat",
  },
  {
    key: "life",
    word: "Life",
    title: "Coaching and Counseling",
    body: "We guide individuals on a purposeful life journey with personalized coaching, helping them navigate life’s quest and align personal and professional growth.",
    points: ["Personal growth", "Work-life balance", "Professional development"],
    image: "lifeTree",
  },
  {
    key: "consciousness",
    word: "Consciousness",
    title: "Self, Mind and Awareness",
    body: "Our programmes promote holistic development through self-awareness, spiritual growth and consciousness science — encompassing self, organizational, social and environmental consciousness.",
    points: ["Self-awareness", "Mind mapping", "Consciousness studies"],
    image: "consciousness",
  },
] as const;

/** I Smart Consciousness Study Centers, run with academic and research institutions. */
export const studyCenters = {
  intro:
    "The I Smart Consciousness Study Center integrates Indian Knowledge Systems (IKS), Western Knowledge Systems (WKS) and transformative life philosophies. The foundation establishes these centers with academic and research institutions as hubs for community engagement, research and training.",
  domains: [
    {
      name: "Observatory",
      body: "Monitoring and analysing cognitive patterns, emotional states and behavioural dynamics for real-time insight into consciousness and decision-making.",
    },
    {
      name: "Exploratory",
      body: "Deep dives into consciousness mapping, mindfulness practices and quantum-emotion studies, for new approaches to problem-solving and personal transformation.",
    },
    {
      name: "Reflectory",
      body: "A space for introspection and assimilation — reflecting on life purpose, aligning work-life goals and fostering sustainable growth through conscious practice.",
    },
  ],
};

/** Gau Kamdhenu Vedic Agriculture Project — an example of the approach in practice. */
export const kamdhenu = {
  name: "Gau Kamdhenu Vedic Agriculture Project",
  nameMarathi: "गौ कामधेनु वैदिक शेती प्रकल्प",
  summary:
    "The Kamdhenu Project, an initiative under I Smart Life Foundation, envisions a transformative model that integrates Vedic agriculture principles with sustainable modern practices. Rooted in Indian Knowledge Systems, it emphasizes the holistic interdependence of humans, animals and nature to achieve ecological balance, economic prosperity and societal well-being.",
  philosophy:
    "The project draws inspiration from Kamdhenu — the divine cow of Indian scriptures, symbolizing abundance, nurturance and sustainability. Kamdhenu represents the intricate balance of ecosystems, where every element has a purposeful role in sustaining life.",
  objectives: [
    {
      title: "Revitalizing ancient wisdom",
      body: "Reintroduce Vedic farming techniques that prioritize natural resources.",
    },
    {
      title: "Cow-centric agriculture",
      body: "A cow-hostel model where urban cow owners collaborate with rural farmers for mutual benefit.",
    },
    {
      title: "Promoting sustainability",
      body: "Encourage chemical-free farming and biodiversity conservation.",
    },
    {
      title: "Knowledge integration",
      body: "Merge Vedic principles with modern agro-technologies for scalable, replicable solutions.",
    },
  ],
  future:
    "The Kamdhenu Project aspires to create a self-sustaining agricultural ecosystem where Vedic knowledge harmonizes with contemporary innovation — fostering a green, conscious and prosperous Bharat, and a lasting legacy of sustainable living for future generations.",
};

/** The foundation's wider institutional activities — distinct from either publication's scope. */
export const initiatives = [
  "I Smart Consciousness Study Center",
  "Integration of Indian Knowledge Systems and Western Knowledge Systems",
  "Observatory, Exploratory and Reflectory frameworks",
  "Institutional collaborations",
  "Research and faculty development programs",
  "Gau Kamdhenu Vedic Agriculture Project",
  "Cognitive development and consciousness research",
];

/* ---------- Publications registry ---------- */

/** Diwali (Lakshmi Puja) 2026 falls on Sunday, 8 November 2026. */
export const LIFE_SUTRA_FIRST_ISSUE = "Diwali, 8 November 2026";

export type Publication = {
  slug: "life-sutra-synthesis" | "life-sutra";
  title: string;
  category: string;
  designation: string;
  description: string;
  status: string;
  href: string;
  cta: string;
};

export const publications: Publication[] = [
  {
    slug: "life-sutra-synthesis",
    title: "Life Sutra Synthesis",
    category: "Interdisciplinary Research Journal",
    designation: "Research Journal",
    description:
      "An interdisciplinary research journal dedicated to exploring, documenting, and synthesising knowledge related to Indian Knowledge Systems through scholarly research and dialogue.",
    status: "First issue — 11 October 2026",
    href: JOURNAL_BASE,
    cta: "Explore Journal",
  },
  {
    slug: "life-sutra",
    title: "Life Sutra",
    category: "Journal",
    designation: "Journal",
    description:
      "A journal published by I Smart Life Foundation, dedicated to developing and sharing knowledge.",
    status: `First issue — ${LIFE_SUTRA_FIRST_ISSUE}`,
    href: IMPRINT_BASE,
    cta: "Explore Journal",
  },
];

/* ---------- Imagery ---------- */

/**
 * Images used on the foundation and Life Sutra pages. The `foundation/`
 * images come from the foundation's own site (manasyog.life); the rest are
 * the project's existing library images.
 */
export const imagery = {
  greenHabitat: {
    src: "/assets/foundation/green-habitat.jpg",
    alt: "Illustration of a green neighbourhood with solar roofs, wind turbines, gardens and cycle paths",
    caption: "Work — green habitat",
    width: 560,
    height: 586,
  },
  lifeTree: {
    src: "/assets/foundation/life-tree.jpg",
    alt: "Illustration of a person meditating beneath a large tree beside a home and garden",
    caption: "Life — purposeful living",
    width: 572,
    height: 507,
  },
  consciousness: {
    src: "/assets/foundation/consciousness.jpg",
    alt: "Painted illustration of a woman seated in meditation surrounded by flowing colour",
    caption: "Consciousness — self, mind and awareness",
    width: 1400,
    height: 1400,
  },
  kamdhenu: {
    src: "/assets/foundation/kamdhenu-calf.jpg",
    alt: "A young calf standing in a farm field at sunset",
    caption: "Gau Kamdhenu Vedic Agriculture Project",
    width: 662,
    height: 799,
  },
  workshop: {
    src: "/assets/foundation/workshop.jpg",
    alt: "Illustration of people working together around a table covered in charts",
    caption: "Workshops and faculty development",
    width: 1400,
    height: 1400,
  },
  cognition: {
    src: "/assets/foundation/cognition.jpg",
    alt: "Model of a human brain",
    caption: "Cognitive development and consciousness research",
    width: 1400,
    height: 1400,
  },
  inquiry: {
    src: "/assets/hero-reading-room.jpg",
    alt: "A researcher working at a long desk in a wood-panelled reading room lined with books",
    caption: "Inquiry — research as a daily practice",
    width: 1920,
    height: 1280,
  },
  heritage: {
    src: "/assets/gallery-heritage.jpg",
    alt: "Close view of intricately carved stone pillars in a historic Indian colonnade",
    caption: "Heritage — knowledge carried in craft and architecture",
    width: 1200,
    height: 1800,
  },
  collaboration: {
    src: "/assets/gallery-collaboration.jpg",
    alt: "A group of young researchers discussing work around a table with laptops",
    caption: "Collaboration — people learning with and from one another",
    width: 1200,
    height: 800,
  },
  manuscripts: {
    src: "/assets/gallery-manuscripts.jpg",
    alt: "Pages of old printed texts and manuscripts laid over one another",
    caption: "Texts — the long conversation that journals continue",
    width: 1200,
    height: 1800,
  },
} as const;
