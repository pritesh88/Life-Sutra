/**
 * Books by I Smart Life Foundation and its people, shown on the foundation
 * site only. Facts come from the covers and the publishers' listings
 * (Amazon.in, Excel India Publishers) or were supplied by the foundation.
 * Leave a field out rather than guess — empty fields are simply not shown.
 */

export type Book = {
  slug: string;
  title: string;
  subtitle?: string;
  /** Who wrote or edited it, as printed on the cover. */
  credits: {
    role: "Author" | "Authors" | "Editors" | "Chief Editor" | "Author / Editor";
    names: string[];
  }[];
  /** For edited volumes: the foundation's contribution inside it. */
  contribution?: string;
  publisher?: string;
  published?: string;
  language?: string;
  pages?: number;
  formats?: string[];
  isbn?: { label: string; value: string }[];
  description?: string;
  cover?: { src: string; width: number; height: number };
  link?: { href: string; label: string };
};

export const publishedBooks: Book[] = [
  {
    slug: "holy-tulsi-consciousness",
    title: "Holy Tulsi Consciousness",
    subtitle:
      "A Complete Consciousness Civilisation Framework through the Sacred Science of Ocimum Sanctum",
    credits: [{ role: "Author", names: ["Dr. Mahesh S. Lohar"] }],
    publisher: "Bhabad International Publication",
    published: "2 June 2026",
    language: "English",
    pages: 156,
    formats: ["Paperback", "Kindle"],
    description:
      "Body, mind, emotions, community, nature, spirit, consciousness — from ancient wisdom to a sustainable future.",
    cover: { src: "/assets/books/holy-tulsi-consciousness.jpg", width: 800, height: 1136 },
    link: { href: "https://www.amazon.in/dp/B0H3TR5T3V", label: "Buy on Amazon" },
  },
  {
    slug: "trikayee",
    title: "Trikayee",
    subtitle: "Holistic Health Management",
    credits: [{ role: "Authors", names: ["Dr. Shilpa S. Mestry", "Dr. Mahesh S. Lohar"] }],
    publisher: "Bhabad International Publication",
    published: "2 June 2026",
    language: "English",
    pages: 500,
    formats: ["Paperback", "Kindle"],
    cover: { src: "/assets/books/trikayee.jpg", width: 800, height: 1136 },
    link: { href: "https://www.amazon.in/dp/B0H3THFK6V", label: "Buy on Amazon" },
  },
  {
    slug: "spirituality-happiness-global-well-being",
    title: "Spirituality, Happiness, and Global Well-being",
    subtitle: "Insights from the Indian Knowledge Systems",
    credits: [
      { role: "Chief Editor", names: ["Prof. P.N. Jha"] },
      { role: "Editors", names: ["Prof. Amitabh Pandey", "Prof. Pallavi Pathak"] },
    ],
    contribution: "Chapter 9",
    publisher: "Excel India Publishers",
    published: "December 2025",
    language: "English",
    formats: ["Paperback", "eBook"],
    isbn: [
      { label: "ISBN (Print)", value: "978-93-49666-86-3" },
      { label: "ISBN (eBook)", value: "978-93-49666-30-6" },
    ],
    description:
      "An edited volume of 19 peer-reviewed research papers on Vedic teachings on happiness, inner peace and global harmony, spirituality and interfaith dialogue in peace-building, and Indian cultural festivals and collective well-being.",
    cover: {
      src: "/assets/books/spirituality-happiness-global-well-being.jpg",
      width: 800,
      height: 1083,
    },
    link: {
      href: "https://excelindiapublishers.com/shop/spirituality-happiness-and-global-well-being-insights-from-the-indian-knowledge-systems/",
      label: "View at Excel India Publishers",
    },
  },
  {
    slug: "iks-multidisciplinary-approach",
    title: "Indian Knowledge Systems",
    subtitle: "A Multidisciplinary Approach",
    credits: [{ role: "Editors", names: ["Dr. V.K. Jain", "Dr. Alka Agarwal"] }],
    contribution:
      "Chapter: Holistic Approach to Agriculture Using Indigenous Knowledge and Modern Technology",
    publisher: "Redshine Publication UK",
    published: "March 2026",
    language: "English",
    formats: ["Paperback"],
    isbn: [
      { label: "ISBN-13", value: "978-1-105-48857-3" },
      { label: "ISBN-10", value: "1-105-48857-8" },
    ],
    cover: { src: "/assets/books/iks-multidisciplinary-approach.jpg", width: 791, height: 1200 },
    link: {
      href: "https://www.abebooks.com/servlet/SearchResults?isbn=9781105488573",
      label: "Find on AbeBooks",
    },
  },
];

export const upcomingBooks: Book[] = [
  {
    slug: "kamdhenu-conference-2026-digital-souvenir",
    title: "Kamdhenu Conference 2026",
    subtitle:
      "Proceedings & Digital Souvenir — Knowledge, Consciousness, Cow-Based Sustainability & Circular Economy",
    credits: [{ role: "Author / Editor", names: ["Dr. Shrikant Waghulkar"] }],
    published: "2026",
    language: "English",
    isbn: [{ label: "ISBN", value: "978-81-998147-1-4" }],
  },
  {
    slug: "kamdhenu-conference-2026-souvenir",
    title: "Kamdhenu Conference 2026",
    subtitle:
      "Proceedings & Souvenir — Knowledge, Consciousness, Cow-Based Sustainability & Circular Economy",
    credits: [{ role: "Author / Editor", names: ["Dr. Shrikant Waghulkar"] }],
    published: "2026",
    language: "English",
    isbn: [{ label: "ISBN", value: "978-81-998147-0-7" }],
  },
];
