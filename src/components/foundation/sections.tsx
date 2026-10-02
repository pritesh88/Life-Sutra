import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import {
  FOUNDATION,
  aboutFacts,
  aboutParagraphs,
  approachIntro,
  cultureParagraphs,
  foundationAddress,
  imagery,
  initiatives,
  kamdhenu,
  mahavakyaExplained,
  missionAreas,
  missionProgrammes,
  pillars,
  publications,
  studyCenters,
  visionStrands,
} from "@/data/foundation";
import { JOURNAL, issueLabel, journalIssues } from "@/data/journal";
import { FOUNDATION_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { AssessmentWidget } from "./AssessmentWidget";
import { JournalCover, LifeSutraCover, PublicationShelf } from "./PublicationCards";
import { TriadDiagram, TriadMark } from "./TriadDiagram";
import { Wrap } from "./Wrap";

/* ---------- Building blocks ---------- */

type Tone = "ivory" | "paper" | "mist" | "indigo";

export function FSection({
  id,
  tone = "ivory",
  className,
  children,
  labelledBy,
}: {
  id?: string | undefined;
  tone?: Tone;
  className?: string | undefined;
  children: ReactNode;
  labelledBy?: string | undefined;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "scroll-mt-24 py-20 sm:py-28",
        tone === "ivory" && "bg-islf-ivory",
        tone === "paper" && "bg-islf-paper",
        tone === "mist" && "bg-islf-mist",
        tone === "indigo" && "islf-aurora text-islf-ivory",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <p className={cn("islf-kicker flex items-center gap-3 text-islf-magenta-text", className)}>
      <span className="islf-spectrum h-0.5 w-7" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Section heading: light-weight serif, deliberately unshouty. */
export function FHeading({
  id,
  kicker,
  title,
  lede,
  onDark = false,
  className,
}: {
  id?: string | undefined;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  onDark?: boolean;
  className?: string | undefined;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <Kicker className={onDark ? "text-islf-glow" : undefined}>{kicker}</Kicker>
      <h2 id={id} className="mt-5 text-[1.9rem] leading-[1.15] sm:text-[2.4rem]">
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            "mt-5 max-w-xl text-[1.02rem] leading-relaxed",
            onDark ? "text-islf-ivory/75" : "text-islf-muted",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

function TextLink({
  href,
  children,
  onDark,
}: {
  href: string;
  children: ReactNode;
  onDark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 border-b pb-1 text-sm font-semibold transition-colors",
        onDark
          ? "border-islf-ivory/40 text-islf-ivory hover:border-islf-ivory"
          : "border-islf-indigo/30 text-islf-indigo hover:border-islf-magenta hover:text-islf-magenta-text",
      )}
    >
      {children}
      <ArrowRight
        className="size-4 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

function Photo({
  image,
  className,
  sizes,
  priority,
  caption = true,
  imgClassName,
}: {
  image: (typeof imagery)[keyof typeof imagery];
  className?: string | undefined;
  sizes: string;
  priority?: boolean;
  caption?: boolean;
  imgClassName?: string | undefined;
}) {
  return (
    <figure className={className}>
      <div className="relative h-full overflow-hidden bg-islf-stone">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority ?? false}
          className={cn("object-cover", imgClassName)}
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-xs text-islf-muted">{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}

/* ---------- Hero: the publishing body and its two publications ---------- */

export function Hero() {
  const [journal, imprint] = publications;
  return (
    <section className="islf-aurora relative overflow-hidden text-islf-ivory">
      <div
        className="pointer-events-none absolute -bottom-56 -left-40 hidden w-[36rem] text-islf-ivory/10 lg:block"
        aria-hidden="true"
      >
        <TriadDiagram labels={false} />
      </div>
      <Wrap className="relative grid gap-16 pt-16 pb-14 sm:pt-24 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-20">
        <div className="islf-rise lg:col-span-6">
          <h1 className="text-[2.5rem] leading-[1.1] sm:text-[3.3rem]">
            <a
              href={FOUNDATION.legacyWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="decoration-islf-glow/60 decoration-1 underline-offset-8 hover:underline"
            >
              {FOUNDATION.name}
            </a>
          </h1>
          <p className="mt-4 max-w-xl text-[1.02rem] leading-snug text-islf-glow">
            {FOUNDATION.descriptor}
          </p>
          <p className="mt-5 flex items-center gap-3 font-islf-serif text-lg text-islf-ivory/80 italic">
            <span className="islf-spectrum h-0.5 w-8" aria-hidden="true" />
            {FOUNDATION.tagline}
          </p>
          <p className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-islf-ivory/80">
            The publishing body of two journals — <em>Life Sutra Synthesis</em>, an
            interdisciplinary research journal, and <em>Life Sutra</em>.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href={`${FOUNDATION_ROUTES.home}#publications`}
              className="inline-flex h-12 items-center gap-2 bg-islf-paper px-6 text-sm font-semibold text-islf-indigo transition-colors hover:bg-islf-glow"
            >
              Explore Publications <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <TextLink href={`${FOUNDATION_ROUTES.home}#about`} onDark>
              About the Foundation
            </TextLink>
          </div>
        </div>

        {/* The two publications, shown as the objects they are. */}
        <div className="lg:col-span-6">
          <div className="grid grid-cols-2 items-start gap-6 sm:gap-10">
            {[
              { pub: journal!, cover: <JournalCover />, tilt: "lg:-rotate-2" },
              { pub: imprint!, cover: <LifeSutraCover />, tilt: "lg:rotate-2" },
            ].map(({ pub, cover, tilt }) => (
              <Link key={pub.slug} href={pub.href} className="group block">
                <div
                  className={cn(
                    "mx-auto w-full max-w-[13rem] transition-transform duration-500 group-hover:-translate-y-2",
                    tilt,
                  )}
                >
                  {cover}
                </div>
                <div className="mt-8 border-t border-islf-ivory/20 pt-4 lg:mt-12">
                  <p className="islf-kicker text-[0.56rem] text-islf-glow">{pub.category}</p>
                  <p className="mt-1.5 font-islf-serif text-xl group-hover:underline">
                    {pub.title}
                  </p>
                  <p className="mt-1 text-xs text-islf-ivory/70">{pub.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

/* ---------- Sub-page intro ---------- */

export function PageIntro({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children?: ReactNode;
}) {
  return (
    <header className="islf-aurora relative overflow-hidden text-islf-ivory">
      <div
        className="pointer-events-none absolute top-1/2 -right-24 hidden w-[26rem] -translate-y-1/2 text-islf-ivory/15 md:block"
        aria-hidden="true"
      >
        <TriadDiagram labels={false} />
      </div>
      <Wrap className="relative py-16 sm:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-islf-ivory/70">
          <Link href="/" className="hover:text-islf-ivory hover:underline">
            {FOUNDATION.name}
          </Link>
          <span className="px-2">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        <Kicker className="mt-8 text-islf-glow">{kicker}</Kicker>
        <h1 className="mt-5 max-w-3xl text-[2.3rem] leading-[1.1] sm:text-[3rem]">{title}</h1>
        <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-islf-ivory/80">{lede}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </Wrap>
    </header>
  );
}

/* ---------- About ---------- */

export function AboutSection({ showLink = true }: { showLink?: boolean }) {
  return (
    <FSection id="about" labelledBy="about-title" tone="paper">
      <Wrap className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <FHeading id="about-title" kicker="About" title="About the Foundation" />
          <p className="mt-8 font-islf-serif text-[1.35rem] leading-snug">{aboutParagraphs[0]}</p>
          {aboutParagraphs.slice(1).map((p) => (
            <p key={p} className="mt-5 text-[1rem] leading-relaxed text-islf-muted">
              {p}
            </p>
          ))}
          <dl className="mt-10 grid border-t border-islf-stone sm:grid-cols-2">
            {aboutFacts.map((f) => (
              <div key={f.label} className="min-w-0 border-b border-islf-stone py-4 sm:odd:pr-6">
                <dt className="islf-kicker text-[0.56rem] text-islf-muted">{f.label}</dt>
                <dd className="mt-1.5 font-islf-serif text-lg leading-snug">{f.value}</dd>
              </div>
            ))}
          </dl>
          {showLink ? (
            <div className="mt-9">
              <TextLink href={FOUNDATION_ROUTES.about}>More about the foundation</TextLink>
            </div>
          ) : null}
        </div>

        {/* The founding Mahavakya, explained. */}
        <figure className="relative self-start overflow-hidden bg-islf-mist p-8 sm:p-10 lg:col-span-5 lg:col-start-8">
          <span className="islf-spectrum absolute inset-x-0 top-0 h-1" aria-hidden="true" />
          <p className="islf-kicker text-[0.6rem] text-islf-magenta-text">Founding principle</p>
          <blockquote>
            <p
              lang="sa-Latn"
              className="mt-5 font-islf-serif text-[2.3rem] leading-none text-islf-indigo italic sm:text-[2.8rem]"
            >
              {FOUNDATION.mahavakya.transliteration}
            </p>
            <p className="mt-3 font-islf-serif text-lg">
              &ldquo;{FOUNDATION.mahavakya.translation}&rdquo;
            </p>
            <p className="mt-6 text-[0.95rem] leading-relaxed text-islf-muted">
              {mahavakyaExplained.meaning}
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-islf-muted">
              {mahavakyaExplained.atman}
            </p>
          </blockquote>
          <figcaption className="mt-6 text-sm text-islf-indigo">
            — {mahavakyaExplained.heading.split(":")[1]?.trim()}, {mahavakyaExplained.attribution}
          </figcaption>
        </figure>
      </Wrap>
    </FSection>
  );
}

/* ---------- Publications ---------- */

export function PublicationsSection({ asPage = false }: { asPage?: boolean }) {
  return (
    <FSection
      id="publications"
      labelledBy={asPage ? undefined : "publications-title"}
      className={asPage ? "pt-16 sm:pt-20" : undefined}
    >
      <Wrap>
        {asPage ? null : (
          <div className="mb-16 grid gap-10 lg:grid-cols-12 lg:items-end">
            <FHeading
              id="publications-title"
              kicker="Publications"
              title="Our Publications"
              lede="Two journals published by I Smart Life Foundation: Life Sutra Synthesis, an interdisciplinary research journal, and Life Sutra."
              className="lg:col-span-7"
            />
            <div className="border-l-2 border-islf-magenta pl-5 lg:col-span-4 lg:col-start-9">
              <p className="islf-kicker text-[0.56rem] text-islf-muted">Publishing Body</p>
              <p className="mt-2 font-islf-serif text-lg leading-snug">
                <a
                  href={FOUNDATION.legacyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:text-islf-indigo hover:underline"
                >
                  {FOUNDATION.publishingBody}
                </a>
              </p>
            </div>
          </div>
        )}
        <PublicationShelf headingLevel={asPage ? "h2" : "h3"} />
      </Wrap>
    </FSection>
  );
}

/* ---------- Publisher & publication particulars (ISSN preliminary details) ---------- */

function ParticularsTable({ caption, rows }: { caption: string; rows: [string, ReactNode][] }) {
  return (
    <table className="w-full self-start border-collapse text-left text-[0.95rem]">
      <caption className="islf-kicker mb-4 text-left text-[0.6rem] text-islf-magenta-text">
        {caption}
      </caption>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-t border-islf-stone last:border-b">
            <th
              scope="row"
              className="w-[42%] py-3 pr-4 align-top text-[0.8rem] font-semibold text-islf-ink"
            >
              {label}
            </th>
            <td className="py-3 align-top break-words text-islf-muted">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ParticularsSection() {
  const current = journalIssues[0];
  const { contact } = FOUNDATION;
  const [journalPub, imprintPub] = publications;
  return (
    <FSection id="particulars" tone="paper" labelledBy="particulars-title">
      <Wrap>
        <FHeading
          id="particulars-title"
          kicker="Publication Details"
          title="Publisher & Publication Details"
          lede="Preliminary details of the publishing body and its publications."
        />
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-14">
          <ParticularsTable
            caption="Publishing Body"
            rows={[
              ["Publisher", FOUNDATION.publishingBody],
              [
                "Type of Publisher",
                `Institutional publisher (${FOUNDATION.legalForm}) — not an individual publisher`,
              ],
              ["Owner", FOUNDATION.owner],
              ["Publisher's Address", foundationAddress()],
              ["Email", contact.email],
              ["Phone", contact.phone],
              ["Website", FOUNDATION.website],
            ]}
          />
          <div className="grid gap-12">
            <ParticularsTable
              caption={`${journalPub!.title} — ${journalPub!.category}`}
              rows={[
                [
                  "Title",
                  <Link
                    key="t"
                    href={journalPub!.href}
                    className="text-islf-indigo underline-offset-4 hover:underline"
                  >
                    {JOURNAL.title}
                  </Link>,
                ],
                ["ISSN (Online)", JOURNAL.issn],
                ["Starting Year", String(JOURNAL.startingYear)],
                ["Frequency", JOURNAL.frequency],
                ["Format of Publication", `${JOURNAL.format} only`],
                ["Subject", JOURNAL.subject],
                ["Language", JOURNAL.language],
                ["Publication Details", current ? issueLabel(current) : "—"],
              ]}
            />
            <ParticularsTable
              caption={`${imprintPub!.title} — ${imprintPub!.category}`}
              rows={[
                [
                  "Title",
                  <Link
                    key="t"
                    href={imprintPub!.href}
                    className="text-islf-indigo underline-offset-4 hover:underline"
                  >
                    {imprintPub!.title}
                  </Link>,
                ],
                ["Type", imprintPub!.designation],
                ["Status", imprintPub!.status],
              ]}
            />
          </div>
        </div>
      </Wrap>
    </FSection>
  );
}

/* ---------- Vision ---------- */

export function VisionSection() {
  return (
    <FSection id="vision" tone="mist" labelledBy="vision-title">
      <Wrap className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <FHeading
              id="vision-title"
              kicker="Vision"
              title="Our Vision"
              lede="One thread — from inquiry, through society, to the individual — each strand informing the others."
            />
          </div>
        </div>
        <ol className="relative lg:col-span-7 lg:col-start-6">
          <span
            className="islf-spectrum absolute top-3 bottom-3 left-[0.45rem] w-px opacity-60"
            aria-hidden="true"
          />
          {visionStrands.map((s, i) => (
            <li key={s.strand} className="relative pb-12 pl-12 last:pb-0">
              <span
                className="absolute top-1.5 left-0 grid size-[0.95rem] place-items-center rounded-full border border-islf-indigo bg-islf-mist"
                aria-hidden="true"
              >
                <span className="size-1.5 rounded-full bg-islf-magenta" />
              </span>
              <p className="islf-kicker text-[0.6rem] text-islf-indigo">
                {String(i + 1).padStart(2, "0")} — {s.strand}
              </p>
              <ul className="mt-4 grid gap-3">
                {s.themes.map((t) => (
                  <li
                    key={t}
                    className="font-islf-serif text-[1.3rem] leading-snug sm:text-[1.45rem]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Wrap>
    </FSection>
  );
}

/* ---------- Mission ---------- */

export function MissionSection() {
  return (
    <FSection id="mission" tone="paper" labelledBy="mission-title">
      <Wrap>
        <FHeading
          id="mission-title"
          kicker="Mission"
          title="Our Mission"
          lede="How the vision becomes practice — across people, knowledge, environment and institutions."
        />
        <ol className="mt-12 border-t border-islf-indigo/70">
          {missionAreas.map((m, i) => (
            <li
              key={m.title}
              className="grid gap-2 border-b border-islf-stone py-6 transition-colors hover:bg-islf-mist/60 sm:grid-cols-12 sm:gap-8"
            >
              <span className="font-mono text-xs text-islf-magenta-text sm:col-span-1 sm:pt-1.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[1.35rem] leading-tight sm:col-span-5">{m.title}</h3>
              <p className="text-[0.98rem] leading-relaxed text-islf-muted sm:col-span-6 sm:pt-1">
                {m.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16">
          <p className="islf-kicker text-[0.6rem] text-islf-muted">
            Mission in practice — programmes
          </p>
          <ul className="mt-6 grid gap-px border border-islf-stone bg-islf-stone sm:grid-cols-2 lg:grid-cols-3">
            {missionProgrammes.map((p) => (
              <li key={p.title} className="relative bg-islf-paper p-6">
                <span
                  className="islf-spectrum absolute inset-x-0 top-0 h-0.5 opacity-70"
                  aria-hidden="true"
                />
                <h3 className="font-islf-serif text-xl">{p.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-islf-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Wrap>
    </FSection>
  );
}

/* ---------- Culture ---------- */

export function CultureSection() {
  return (
    <FSection id="culture" labelledBy="culture-title">
      <Wrap className="grid lg:grid-cols-12">
        <Photo
          image={imagery.workshop}
          className="aspect-[4/3] lg:col-span-6 lg:col-start-1 lg:row-start-1"
          sizes="(max-width: 1024px) 100vw, 50vw"
          caption={false}
        />
        <div className="relative z-10 -mt-12 ml-5 bg-islf-paper p-8 shadow-[0_30px_60px_-40px_rgb(35_27_58/0.5)] sm:ml-16 sm:p-11 lg:col-span-6 lg:col-start-6 lg:row-start-1 lg:mt-20 lg:ml-0 lg:self-start">
          <Kicker>Culture</Kicker>
          <h2 id="culture-title" className="mt-5 text-[1.7rem] leading-[1.25] sm:text-[2rem]">
            {cultureParagraphs[0]}
          </h2>
          {cultureParagraphs.slice(1).map((p) => (
            <p key={p} className="mt-5 text-[1rem] leading-relaxed text-islf-muted">
              {p}
            </p>
          ))}
        </div>
      </Wrap>
    </FSection>
  );
}

/* ---------- Approach ---------- */

export function ApproachSection({ showLink = true }: { showLink?: boolean }) {
  return (
    <FSection id="approach" tone="paper" labelledBy="approach-title">
      <Wrap>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <FHeading
            id="approach-title"
            kicker="Our Approach"
            title="Work, Life and Consciousness"
            className="lg:col-span-6"
          />
          <p className="text-[1rem] leading-relaxed text-islf-muted lg:col-span-6">
            {approachIntro}
          </p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
          {pillars.map((p, i) => (
            <li key={p.key} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-islf-mist">
                <Image
                  src={imagery[p.image].src}
                  alt={imagery[p.image].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute top-3 left-3 bg-islf-paper/90 px-2 py-1 font-mono text-[0.65rem] text-islf-magenta-text">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-6 font-islf-serif text-[2rem] leading-none">{p.word}</p>
              <h3 className="mt-2 font-islf-serif text-lg text-islf-magenta-text italic">
                {p.title}
              </h3>
              <p className="mt-4 text-[0.97rem] leading-relaxed text-islf-muted">{p.body}</p>
              <p className="mt-4 text-sm text-islf-ink/80">{p.points.join("  ·  ")}</p>
            </li>
          ))}
        </ol>

        {/* I Smart Consciousness Study Centers */}
        <div className="mt-20 grid gap-10 bg-islf-mist p-8 sm:p-12 lg:grid-cols-12 lg:items-center">
          <div className="mx-auto w-full max-w-[16rem] text-islf-indigo lg:col-span-3">
            <TriadDiagram ring={false} labels={false} />
          </div>
          <div className="lg:col-span-9">
            <p className="islf-kicker text-[0.6rem] text-islf-magenta-text">
              I Smart Consciousness Study Centers
            </p>
            <p className="mt-4 max-w-3xl text-[1rem] leading-relaxed text-islf-muted">
              {studyCenters.intro}
            </p>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {studyCenters.domains.map((d) => (
                <li key={d.name} className="border-t-2 border-islf-indigo pt-4">
                  <h3 className="font-islf-serif text-xl">{d.name}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-islf-muted">{d.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {showLink ? (
          <div className="mt-12">
            <TextLink href={FOUNDATION_ROUTES.approach}>Read about our approach</TextLink>
          </div>
        ) : null}
      </Wrap>
    </FSection>
  );
}

/* ---------- Vedic Agriculture: the approach in practice ---------- */

export function KamdhenuSection() {
  return (
    <FSection
      id="vedic-agriculture"
      tone="indigo"
      labelledBy="kamdhenu-title"
      className="relative overflow-hidden"
    >
      <Wrap className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
        <figure className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={imagery.kamdhenu.src}
              alt={imagery.kamdhenu.alt}
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover"
            />
            <span className="islf-spectrum absolute inset-x-0 bottom-0 h-1.5" aria-hidden="true" />
          </div>
          <figcaption className="mt-6 text-xs text-islf-ivory/65">
            {imagery.kamdhenu.caption}
          </figcaption>
        </figure>

        <div className="lg:col-span-7">
          <FHeading
            id="kamdhenu-title"
            onDark
            kicker="In practice · Vedic Agriculture"
            title={kamdhenu.name}
          />
          <p lang="mr" className="mt-3 text-lg text-islf-glow">
            {kamdhenu.nameMarathi}
          </p>
          <p className="mt-6 text-[1.02rem] leading-relaxed text-islf-ivory/80">
            {kamdhenu.summary}
          </p>
          <blockquote className="mt-7 border-l-2 border-islf-glow pl-5 font-islf-serif text-[1.15rem] leading-relaxed text-islf-ivory/90 italic">
            {kamdhenu.philosophy}
          </blockquote>
          <p className="islf-kicker mt-10 text-[0.6rem] text-islf-glow">Objectives</p>
          <ol className="mt-4 grid gap-x-8 sm:grid-cols-2">
            {kamdhenu.objectives.map((o, i) => (
              <li key={o.title} className="flex gap-4 border-t border-islf-ivory/20 py-4">
                <span className="font-mono text-xs text-islf-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-islf-serif text-lg">{o.title}</span>
                  <span className="mt-1 block text-[0.9rem] leading-relaxed text-islf-ivory/70">
                    {o.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-[0.98rem] leading-relaxed text-islf-ivory/80">
            <span className="font-semibold text-islf-ivory">Vision for the future. </span>
            {kamdhenu.future}
          </p>
        </div>
      </Wrap>
    </FSection>
  );
}

/* ---------- Initiatives (About page) ---------- */

export function InitiativesSection() {
  return (
    <FSection id="initiatives" tone="indigo" labelledBy="initiatives-title">
      <Wrap className="grid gap-14 lg:grid-cols-12">
        <FHeading
          id="initiatives-title"
          onDark
          kicker="Research & Institutional Initiatives"
          title="A wider research ecosystem"
          lede="The foundation’s broader institutional activities. They sit alongside its publications and are distinct from the editorial scope of either one."
          className="lg:col-span-5"
        />
        <ol className="grid border-t border-islf-ivory/20 sm:grid-cols-2 sm:gap-x-10 lg:col-span-6 lg:col-start-7 lg:mt-12">
          {initiatives.map((item, i) => (
            <li key={item} className="flex items-baseline gap-4 border-b border-islf-ivory/20 py-5">
              <span className="font-mono text-xs text-islf-glow">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-islf-serif text-[1.15rem] leading-snug">{item}</span>
            </li>
          ))}
        </ol>
      </Wrap>
    </FSection>
  );
}

/* ---------- Assessment ---------- */

export function AssessmentSection() {
  return (
    <FSection id="assessment" tone="mist" labelledBy="assessment-title">
      <Wrap className="grid gap-12 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4 lg:pt-6">
          <FHeading
            id="assessment-title"
            kicker="Smart Assessment"
            title="How balanced is your life today?"
            lede="A one-minute reflection across five dimensions — people, planet, prosperity, peace and partnership."
          />
          <p className="mt-8 flex items-start gap-3 text-sm leading-relaxed text-islf-muted">
            <TriadMark className="mt-0.5 size-4 shrink-0 text-islf-indigo" />
            Private by design: nothing you answer leaves your browser.
          </p>
        </div>
        <div className="lg:col-span-8">
          <AssessmentWidget />
        </div>
      </Wrap>
    </FSection>
  );
}

/* ---------- Contact ---------- */

export function ContactDetails({ className }: { className?: string | undefined }) {
  const { contact } = FOUNDATION;
  const rows = [
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { icon: Phone, label: "Phone", value: contact.phone, href: contact.phoneHref },
    { icon: MapPin, label: "Location", value: foundationAddress() },
  ];
  return (
    <div className={cn("border-t-2 border-islf-indigo", className)}>
      <div className="border-b border-islf-stone py-7">
        <p className="islf-kicker text-[0.56rem] text-islf-muted">Contact person</p>
        <p className="mt-2 font-islf-serif text-[1.7rem] leading-tight">{contact.person}</p>
        <p className="mt-1 text-sm text-islf-muted">
          {contact.designation}, {FOUNDATION.name}
        </p>
      </div>
      <ul>
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-4 border-b border-islf-stone py-4">
            <r.icon className="size-4 shrink-0 text-islf-magenta-text" aria-hidden="true" />
            <span className="w-20 shrink-0 text-xs text-islf-muted">{r.label}</span>
            {r.href ? (
              <a
                href={r.href}
                className="text-[0.98rem] break-all text-islf-indigo underline-offset-4 hover:underline"
              >
                {r.value}
              </a>
            ) : (
              <span className="text-[0.98rem]">{r.value}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
