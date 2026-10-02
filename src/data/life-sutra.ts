/**
 * Life Sutra — the foundation's book publication. First issue on Diwali,
 * 8 November 2026.
 *
 * To publish: add entries to `imprintBooks` / `imprintEditorial` and fill the
 * null values in `IMPRINT.details`. The page renders placeholders for anything
 * still empty, so no layout change is needed. Never fill these with guesses —
 * in particular, do not add an ISBN until one has actually been assigned.
 */
import { FOUNDATION, LIFE_SUTRA_FIRST_ISSUE, foundationAddress } from "@/data/foundation";

export const IMPRINT_STATUS = `First Issue — ${LIFE_SUTRA_FIRST_ISSUE}`;

export const IMPRINT = {
  title: "Life Sutra",
  category: "Book Publication",
  status: IMPRINT_STATUS,
  publisher: FOUNDATION.publishingBody,
  summary:
    "A publication initiative under I Smart Life Foundation, dedicated to developing and sharing knowledge through book-length publications.",
  /** Publication-level particulars. null = not yet announced. */
  details: {
    publicationType: "Book publication",
    titles: null as string | null,
    isbn: null as string | null,
    format: null as string | null,
    language: null as string | null,
    firstPublicationDate: LIFE_SUTRA_FIRST_ISSUE as string | null,
    editorialContact: FOUNDATION.contact.email,
  },
} as const;

export type ImprintBook = {
  slug: string;
  title: string;
  subtitle?: string;
  authors: string[];
  description?: string;
  /** Only once actually assigned. */
  isbn?: string;
  format?: string;
  language?: string;
  publishedOn?: string;
};

export type ImprintEditor = {
  name: string;
  role: string;
  affiliation?: string;
};

export const imprintBooks: ImprintBook[] = [];

export const imprintEditorial: ImprintEditor[] = [];

export const NOT_ANNOUNCED = "To be announced";

export function imprintDetailRows(): [string, string][] {
  const d = IMPRINT.details;
  return [
    ["Publication", IMPRINT.title],
    ["Type", d.publicationType],
    ["Status", IMPRINT.status],
    ["Title(s)", d.titles ?? NOT_ANNOUNCED],
    ["ISBN", d.isbn ?? "Not yet assigned"],
    ["Format", d.format ?? NOT_ANNOUNCED],
    ["Language", d.language ?? NOT_ANNOUNCED],
    ["First publication", d.firstPublicationDate ?? NOT_ANNOUNCED],
    ["Publisher", IMPRINT.publisher],
    ["Publisher's address", foundationAddress()],
    ["Contact", d.editorialContact],
  ];
}
