import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { BookCover, LifeSutraCover } from "@/components/foundation/PublicationCards";
import { Wrap } from "@/components/foundation/Wrap";
import { FOUNDATION, LIFE_SUTRA_FIRST_ISSUE, imagery } from "@/data/foundation";
import {
  IMPRINT,
  IMPRINT_EMAIL,
  NOT_ANNOUNCED,
  imprintBooks,
  imprintDetailRows,
  imprintEditorial,
} from "@/data/life-sutra";
import { FOUNDATION_ROUTES, IMPRINT_BASE, JOURNAL_BASE } from "@/lib/routes";
import { pageMeta } from "@/lib/seo";
import { ASSETS } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = pageMeta({
  title: "Journal",
  absoluteTitle: "Life Sutra — A Journal of I Smart Life Foundation",
  description: `${IMPRINT.summary} Status: ${IMPRINT.status}.`,
  path: IMPRINT_BASE,
  siteName: "Life Sutra",
});

/* ---------- Building blocks ---------- */

/** Chapter opener: a roman numeral and a small-caps label, as in a book's contents. */
function Chapter({ n, label }: { n: string; label: string }) {
  return (
    <p className="flex items-baseline gap-4 text-imprint-copper-text">
      <span className="font-imprint-display text-[1.6rem] leading-none italic">{n}</span>
      <span className="h-px w-10 translate-y-[-0.3rem] bg-imprint-copper/60" aria-hidden="true" />
      <span className="islf-kicker text-[0.62rem]">{label}</span>
    </p>
  );
}

function Title({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 id={id} className={cn("mt-6 text-[2.8rem] leading-[1.02] sm:text-[3.6rem]", className)}>
      {children}
    </h2>
  );
}

function StatusStamp({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2.5 border border-imprint-burgundy px-4 py-1.5 font-imprint-display text-[1rem] tracking-[0.1em] text-imprint-burgundy uppercase",
        className,
      )}
    >
      <span className="size-1.5 rotate-45 bg-current" aria-hidden="true" />
      <span className="sr-only">Publication status: </span>
      {IMPRINT.status}
    </p>
  );
}

/** Heights of the three empty places on the forthcoming shelf. */
const SHELF = [
  { h: "h-60 sm:h-80", w: "w-full" },
  { h: "h-72 sm:h-[24rem]", w: "w-full" },
  { h: "h-56 sm:h-[18rem]", w: "w-full" },
];

/* ---------- Page ---------- */

export default function LifeSutraPage() {
  return (
    <>
      {/* Overview */}
      <section id="overview" className="relative scroll-mt-32 overflow-hidden bg-imprint-parchment">
        <Wrap className="grid gap-16 pt-16 pb-20 sm:pt-24 lg:grid-cols-12 lg:gap-8 lg:pb-28">
          <div className="islf-rise lg:col-span-6 lg:pt-10">
            <p className="islf-kicker text-[0.62rem] text-imprint-copper-text">
              {IMPRINT.category} · {FOUNDATION.name}
            </p>
            <h1 className="mt-8 text-[5rem] leading-[0.85] text-imprint-burgundy italic sm:text-[8.5rem]">
              Life
              <br />
              <span className="pl-[0.6em]">Sutra</span>
            </h1>
            <span className="mt-10 block h-px w-24 bg-imprint-copper" aria-hidden="true" />
            <p className="mt-8 max-w-lg font-imprint-body text-[1.3rem] leading-relaxed">
              {IMPRINT.summary}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <StatusStamp />
              <a
                href="#forthcoming"
                className="group inline-flex items-center gap-2 border-b border-imprint-ink/30 pb-1 text-sm font-semibold hover:border-imprint-burgundy hover:text-imprint-burgundy"
              >
                First issue
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          {/* The journal cover in front of a photographic plate. */}
          <div className="relative mx-auto w-full max-w-lg lg:col-span-6 lg:max-w-none">
            <figure className="ml-auto w-[78%]">
              <div className="relative aspect-[4/5] overflow-hidden border-[10px] border-imprint-paper bg-imprint-line shadow-[0_30px_60px_-40px_rgb(57_47_43/0.6)]">
                <Image
                  src={imagery.manuscripts.src}
                  alt={imagery.manuscripts.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 75vw, 38vw"
                  className="object-cover sepia-[0.25] saturate-[0.8]"
                />
              </div>
              <figcaption className="mt-3 text-right font-imprint-body text-sm text-imprint-muted italic">
                Plate I — {imagery.manuscripts.caption.split(" — ")[1]}
              </figcaption>
            </figure>
            <div className="absolute bottom-10 left-0 w-[44%] max-w-[15rem] sm:left-[2%]">
              <LifeSutraCover />
            </div>
          </div>
        </Wrap>
        <div className="border-t border-imprint-line">
          <Wrap className="flex flex-wrap gap-x-10 gap-y-2 py-5 font-imprint-body text-sm text-imprint-muted">
            <span>
              <span className="islf-kicker mr-2 text-[0.56rem]">Publisher</span>
              {FOUNDATION.publishingBody}
            </span>
            <span>
              <span className="islf-kicker mr-2 text-[0.56rem]">Type</span>
              {IMPRINT.details.publicationType}
            </span>
            <span>
              <span className="islf-kicker mr-2 text-[0.56rem]">Status</span>
              {IMPRINT.status}
            </span>
            <span>
              <span className="islf-kicker mr-2 text-[0.56rem]">Email</span>
              <a
                href={`mailto:${IMPRINT_EMAIL}`}
                className="underline decoration-imprint-copper underline-offset-4 hover:text-imprint-burgundy"
              >
                {IMPRINT_EMAIL}
              </a>
            </span>
          </Wrap>
        </div>
      </section>

      {/* The imprint */}
      <section
        id="imprint"
        aria-labelledby="imprint-title"
        className="scroll-mt-32 bg-imprint-paper py-24 sm:py-32"
      >
        <Wrap className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Chapter n="I." label="The Imprint" />
            <Title id="imprint-title">A journal of I Smart Life Foundation</Title>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="max-w-2xl font-imprint-body text-[1.25rem] leading-[1.8]">
              <p className="first-letter:float-left first-letter:mt-1.5 first-letter:mr-3 first-letter:font-imprint-display first-letter:text-[4.8rem] first-letter:leading-[0.75] first-letter:text-imprint-burgundy">
                Life Sutra is a journal published by {FOUNDATION.name}. It is dedicated to
                developing and sharing knowledge.
              </p>
              <p className="mt-6 text-imprint-muted">
                It stands beside the foundation’s research journal,{" "}
                <Link
                  href={JOURNAL_BASE}
                  className="text-imprint-ink underline decoration-imprint-copper underline-offset-4 hover:text-imprint-burgundy"
                >
                  Life Sutra Synthesis
                </Link>
                , as a separate publication with its own editorial identity. Its first issue will be
                released on {LIFE_SUTRA_FIRST_ISSUE}; titles, contributors and publication details
                will be announced here as they are confirmed.
              </p>
            </div>
            <blockquote className="mt-14 border-y border-imprint-line py-8 text-center font-imprint-display text-[1.9rem] leading-snug text-imprint-burgundy italic sm:text-[2.3rem]">
              “Developing and sharing knowledge.”
            </blockquote>
          </div>
        </Wrap>
      </section>

      {/* Forthcoming */}
      <section
        id="forthcoming"
        aria-labelledby="forthcoming-title"
        className="scroll-mt-32 bg-imprint-parchment py-24 sm:py-32"
      >
        <Wrap>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Chapter n="II." label="First Issue" />
              <Title id="forthcoming-title">First issue</Title>
            </div>
            <StatusStamp className="self-start sm:self-auto" />
          </div>

          {imprintBooks.length ? (
            <ul className="mt-16 grid gap-14 sm:grid-cols-2 lg:grid-cols-3">
              {imprintBooks.map((b) => (
                <li key={b.slug}>
                  <BookCover label={b.title} className="max-w-[12rem]" />
                  <h3 className="mt-8 text-[1.9rem] leading-tight">{b.title}</h3>
                  {b.subtitle ? (
                    <p className="mt-1 font-imprint-body text-imprint-muted italic">{b.subtitle}</p>
                  ) : null}
                  <p className="mt-3 text-sm">{b.authors.join(", ")}</p>
                  {b.description ? (
                    <p className="mt-4 font-imprint-body leading-relaxed text-imprint-muted">
                      {b.description}
                    </p>
                  ) : null}
                  <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-imprint-line pt-3 text-xs text-imprint-muted">
                    <dt>Published</dt>
                    <dd>{b.publishedOn ?? NOT_ANNOUNCED}</dd>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-end">
              {/* Empty places on a shelf, waiting for their titles. */}
              <div className="lg:col-span-7">
                <ul
                  className="grid grid-cols-3 items-end gap-3 border-b-2 border-imprint-ink/70 sm:gap-6"
                  aria-label="First-issue articles (not yet announced)"
                >
                  {SHELF.map((s, i) => (
                    <li
                      key={s.h}
                      className={cn(
                        "flex flex-col justify-between border border-b-0 border-dashed border-imprint-copper/80 bg-imprint-paper/70 p-3 sm:p-6",
                        s.h,
                        s.w,
                      )}
                    >
                      <span className="font-imprint-display text-base text-imprint-copper-text italic">
                        No. {i + 1}
                      </span>
                      <span>
                        <span className="block h-px w-8 bg-imprint-copper" aria-hidden="true" />
                        <span className="mt-3 block font-imprint-display text-[1.05rem] leading-tight sm:text-[1.6rem]">
                          Article to be announced
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="max-w-md font-imprint-body text-[1.15rem] leading-relaxed text-imprint-muted lg:col-span-4 lg:col-start-9">
                The first issue will be released on {LIFE_SUTRA_FIRST_ISSUE}. Its articles and
                authors will be listed here once they are confirmed by the publisher.
              </p>
            </div>
          )}
        </Wrap>
      </section>

      {/* Editorial */}
      <section
        id="editorial"
        aria-labelledby="editorial-title"
        className="scroll-mt-32 bg-imprint-paper py-24 sm:py-32"
      >
        <Wrap className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Chapter n="III." label="Editorial" />
            <Title id="editorial-title">Editors &amp; contributors</Title>
          </div>
          <div className="lg:col-span-7 lg:col-start-6 lg:pt-16">
            {imprintEditorial.length ? (
              <ul className="border-t border-imprint-ink/70">
                {imprintEditorial.map((m) => (
                  <li
                    key={m.name}
                    className="grid gap-1 border-b border-imprint-line py-5 sm:grid-cols-2"
                  >
                    <p className="font-imprint-display text-[1.6rem] leading-tight">{m.name}</p>
                    <p className="text-sm text-imprint-muted sm:text-right">
                      <span className="block text-imprint-copper-text">{m.role}</span>
                      {m.affiliation}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="relative border border-imprint-line p-8 sm:p-10">
                {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(
                  (pos) => (
                    <span
                      key={pos}
                      className={cn("absolute size-2.5 bg-imprint-copper/70", pos)}
                      aria-hidden="true"
                    />
                  ),
                )}
                <p className="font-imprint-display text-[1.6rem] leading-snug italic">
                  To be announced
                </p>
                <p className="mt-3 font-imprint-body text-[1.1rem] leading-relaxed text-imprint-muted">
                  The editorial team for Life Sutra will be announced. Members, their roles and
                  affiliations will appear here.
                </p>
              </div>
            )}
          </div>
        </Wrap>
      </section>

      {/* Publication details, set as a colophon */}
      <section
        id="details"
        aria-labelledby="details-title"
        className="scroll-mt-32 border-t border-imprint-line bg-imprint-parchment py-24 sm:py-32"
      >
        <Wrap className="flex flex-col items-center text-center">
          <Chapter n="IV." label="Particulars" />
          <Title id="details-title">Publication details</Title>
          <p className="mt-5 max-w-md font-imprint-body text-[1.05rem] text-imprint-muted italic">
            Particulars not yet confirmed are marked as such. ISSN: To Be Issued.
          </p>
          <table className="mt-14 w-full max-w-2xl border-collapse text-left">
            <caption className="sr-only">Life Sutra publication details</caption>
            <tbody>
              {imprintDetailRows().map(([label, value]) => (
                <tr key={label} className="border-b border-imprint-line">
                  <th
                    scope="row"
                    className="w-[42%] py-3.5 pr-6 align-top text-[0.62rem] font-semibold tracking-[0.18em] text-imprint-muted uppercase sm:text-right"
                  >
                    {label}
                  </th>
                  <td className="border-l border-imprint-line py-3 pl-6 align-top font-imprint-body text-[1.08rem] break-words">
                    {value === IMPRINT_EMAIL ? (
                      <a
                        href={`mailto:${IMPRINT_EMAIL}`}
                        className="underline decoration-imprint-copper underline-offset-4 hover:text-imprint-burgundy"
                      >
                        {IMPRINT_EMAIL}
                      </a>
                    ) : (
                      value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Wrap>
      </section>

      {/* Publisher */}
      <section
        id="publisher"
        aria-labelledby="publisher-title"
        className="scroll-mt-32 bg-imprint-paper py-20"
      >
        <Wrap>
          <div className="grid gap-10 border-t-2 border-imprint-burgundy pt-12 md:grid-cols-12 md:items-center">
            <div className="flex items-center gap-6 md:col-span-8">
              <span className="grid size-20 shrink-0 place-items-center border border-imprint-line bg-white">
                <Image
                  src={ASSETS.ismartlifelogo}
                  alt=""
                  width={255}
                  height={263}
                  className="h-16 w-auto"
                />
              </span>
              <div>
                <p className="islf-kicker text-[0.6rem] text-imprint-copper-text">Publisher</p>
                <h2 id="publisher-title" className="mt-2 text-[2rem] leading-tight">
                  {FOUNDATION.publishingBody}
                </h2>
                <p className="mt-1 text-sm text-imprint-muted">
                  Also the publisher of Life Sutra Synthesis, an interdisciplinary research journal.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 md:col-span-4 md:justify-end">
              <Link
                href="/"
                className="inline-flex h-11 items-center bg-imprint-burgundy px-5 text-sm font-semibold text-imprint-paper transition-colors hover:bg-imprint-burgundy-deep"
              >
                Visit the foundation
              </Link>
              <Link
                href={FOUNDATION_ROUTES.publications}
                className="inline-flex h-11 items-center text-sm font-semibold hover:text-imprint-burgundy hover:underline"
              >
                All publications →
              </Link>
            </div>
          </div>
        </Wrap>
      </section>
    </>
  );
}
