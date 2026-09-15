import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ConferenceCard } from "@/components/site/ConferenceCard";
import { InstitutionCard } from "@/components/site/InstitutionCard";
import { WhitePaperCard } from "@/components/site/CatalogCards";
import { PaperCard } from "@/components/site/PaperCard";
import { ResearcherCard } from "@/components/site/ResearcherCard";
import {
  Action,
  Card,
  Container,
  Eyebrow,
  MetaRow,
  Ornament,
  Section,
  SectionHeading,
  Stat,
  Tag,
} from "@/components/site/primitives";
import {
  conferences,
  editorialPrinciples,
  institutions,
  journalStats,
  opportunities,
  papers,
  researchers,
  whitePapers,
} from "@/data/content";
import { homeContent, homeMeta } from "@/data/pages";
import { ASSETS } from "@/lib/site";

export const metadata = homeMeta;

export default function HomePage() {
  const latest = papers.slice(0, 4);
  const gaps = whitePapers.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-parchment">
        <div className="jaali pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
        <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <Eyebrow>Global Research &amp; Knowledge Platform</Eyebrow>
            <h1 className="mt-5 text-[2.1rem] leading-[1.12] sm:text-[3rem]">
              Discover. Research.
              <span className="block text-primary">Synthesize. Connect.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
              Life Sutra is a global scholarly platform for Indian Knowledge Systems and
              contemporary interdisciplinary research. It connects studies, knowledge claims,
              methodology, researchers and institutions so that scattered work becomes a shared
              body of evidence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Action to="/research" variant="primary" size="lg">
                Explore Research <ArrowRight className="size-4" />
              </Action>
              <Action to="/iks-dialogue" variant="outline" size="lg">
                Explore IKS Knowledge
              </Action>
              <Action to="/research-opportunities" variant="ghost" size="lg">
                Find Research Opportunities
              </Action>
            </div>
          </div>

          <figure className="relative">
            <Image
              src={ASSETS.hero}
              alt="Palm-leaf manuscripts and research notebooks on a reading table beside a carved stone jaali screen"
              width={1600}
              height={1104}
              priority
              className="h-auto w-full rounded-md border border-border object-cover shadow-raised"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <figcaption className="mt-3 text-xs text-muted-foreground">
              Primary-source research room, Oriental Research Institute, Mysuru.
            </figcaption>
          </figure>
        </Container>

        <Container className="relative pb-14">
          <Ornament className="mb-10" />
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {journalStats.map((s) => (
              <Stat key={s.label} label={s.label} value={s.value} />
            ))}
          </dl>
        </Container>
      </section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="What is Life Sutra?"
            title="More than a journal — a research ecosystem"
            description="Life Sutra publishes peer-reviewed scholarship, and also builds the connective infrastructure around it: the claims being studied, the methods used, the people doing the work, and the synthesis that follows."
          />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeContent.ecosystem.map((e) => (
              <Card key={e.title} as="li" className="p-6">
                <span className="font-mono text-xs text-primary">{e.step}</span>
                <h3 className="mt-3 text-lg leading-snug">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
              </Card>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="parchment">
        <Container>
          <SectionHeading
            eyebrow="Vol. 6, Issue 2 — July 2026"
            title="Latest research"
            description="Double-anonymous peer-reviewed studies across textual, field and experimental methods."
            action={
              <Action to="/research" variant="outline" size="sm">
                Explore Research
              </Action>
            }
          />
          <ul className="grid gap-4 sm:grid-cols-2">
            {latest.map((p) => (
              <PaperCard key={p.id} paper={p} variant="summary" />
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="The Life Sutra knowledge model"
            title="Knowledge Claim → Evidence → Research → Synthesis"
            description="A knowledge claim carried by a text or a living practice can be documented on its own terms, then examined against the forms of evidence that are actually appropriate to it — and connected to the studies that already speak to it."
            action={
              <Action to="/iks-dialogue" variant="outline" size="sm">
                Explore IKS Knowledge
              </Action>
            }
          />
          <ol className="grid gap-4 md:grid-cols-4">
            {homeContent.knowledgeModel.map((k, i) => (
              <Card key={k.label} as="li" className="p-6">
                <span className="font-mono text-xs text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base leading-snug">{k.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{k.body}</p>
              </Card>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="parchment">
        <Container>
          <SectionHeading
            eyebrow="From research gap to research project"
            title="Research opportunities"
            description="Open questions and white-paper topics that need investigators. Each gap is stated plainly so a scholar can judge whether it fits their work."
            action={
              <Action to="/research-opportunities" variant="outline" size="sm">
                Explore Opportunities
              </Action>
            }
          />
          <ul className="grid gap-4 lg:grid-cols-3">
            {gaps.map((w) => (
              <WhitePaperCard key={w.id} paper={w} variant="gap" />
            ))}
          </ul>
          <ul className="mt-10 divide-y divide-rule border-t border-rule">
            {opportunities.slice(0, 3).map((o) => (
              <li key={o.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div>
                  <h3 className="text-base leading-snug">{o.title}</h3>
                  <MetaRow className="mt-1.5" items={[o.organisation, o.location, o.funding]} />
                </div>
                <Tag tone="saffron">{o.type}</Tag>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>Research methodology</Eyebrow>
            <blockquote className="mt-5 border-l-2 border-primary pl-5 font-display text-2xl leading-snug text-ink sm:text-[1.75rem]">
              “Method should respond to the nature of the knowledge claim.”
            </blockquote>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Life Sutra does not propose a single universal methodology. It works with a plural,
              pramāṇa-sensitive approach: a textual claim, a historical claim and a clinical claim
              call for different evidence and different designs. What is asked of every study is
              that the reasoning behind the chosen method is stated openly.
            </p>
            <div className="mt-8">
              <Action to="/methodology" variant="outline">
                Explore Methodology
              </Action>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {editorialPrinciples.map((p) => (
              <Card key={p.title} as="li" className="p-5">
                <h3 className="text-base leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="earth">
        <Container>
          <div className="mb-10 max-w-2xl">
            <Eyebrow className="text-earth-foreground/65">Research incubator</Eyebrow>
            <h2 className="mt-3 text-2xl text-earth-foreground sm:text-3xl">
              How a question becomes published research
            </h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-earth-foreground/75">
              The pathway Life Sutra is building, from an initial idea through to synthesis. Stages
              beyond publication of opportunities are being developed.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {homeContent.incubatorPath.map((stage, i) => (
              <li
                key={stage}
                className="rounded-md border border-earth-foreground/18 bg-earth-foreground/[0.06] p-4"
              >
                <span className="font-mono text-xs text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-semibold text-earth-foreground">{stage}</p>
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Action to="/research-opportunities" variant="onEarth" size="sm">
              Explore Research Incubator
            </Action>
            <p className="text-xs text-earth-foreground/60">
              Incubator tooling is in development; opportunities are live today.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Convenings &amp; community"
            title="Conferences, researchers and institutions"
            description="Where the work is presented, and who is doing it."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Conferences
              </h3>
              <ul className="mt-4 grid gap-4">
                {conferences
                  .filter((c) => c.status !== "Archived")
                  .slice(0, 2)
                  .map((c) => (
                    <ConferenceCard key={c.id} conference={c} variant="summary" />
                  ))}
              </ul>
              <div className="mt-4">
                <Action to="/conferences" variant="quiet" size="none">
                  All conferences →
                </Action>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Researchers
              </h3>
              <ul className="mt-4 grid gap-4">
                {researchers.slice(0, 2).map((r) => (
                  <ResearcherCard key={r.id} researcher={r} variant="summary" />
                ))}
              </ul>
              <div className="mt-4">
                <Action to="/researchers" variant="quiet" size="none">
                  Researcher directory →
                </Action>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Institutions
              </h3>
              <ul className="mt-4 grid gap-4">
                {institutions.slice(0, 2).map((i) => (
                  <InstitutionCard key={i.id} institution={i} variant="summary" />
                ))}
              </ul>
              <div className="mt-4">
                <Action to="/institutions" variant="quiet" size="none">
                  All institutions →
                </Action>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="parchment">
        <Container>
          <SectionHeading
            eyebrow="In development"
            title="Life Sutra Research Observatory"
            description="A long-term effort to map the IKS research ecosystem — who is working on what, where, and how the studies relate. The figures below describe the platform today; the observatory itself is still being built."
            action={
              <Action to="/research-impact" variant="outline" size="sm">
                Explore Observatory
              </Action>
            }
          />
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {homeContent.observatoryMetrics.map((m) => (
              <Stat key={m.label} label={m.label} value={m.value} />
            ))}
          </dl>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Life Sutra Journal"
            title="Open access · Peer reviewed · Interdisciplinary"
            description="The publishing standards the journal holds itself to."
            action={
              <Action to="/research" variant="outline" size="sm">
                Explore Research
              </Action>
            }
          />
          <ul className="grid gap-px overflow-hidden rounded-md border border-border bg-rule sm:grid-cols-2 lg:grid-cols-5">
            {homeContent.trustItems.map((t, i) => (
              <li key={t} className="bg-card p-6">
                <span className="font-mono text-xs text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm leading-snug font-semibold">{t}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="parchment">
        <Container>
          <div className="rounded-md border border-border bg-card p-8 text-center sm:p-12">
            <Eyebrow className="justify-center">The Life Sutra pathway</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-3xl text-2xl leading-snug sm:text-3xl">
              From knowledge claim → research → evidence → synthesis → new knowledge
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Read what the field has established, or bring the question you are working on.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Action to="/research" variant="primary" size="lg">
                Explore Research
              </Action>
              <Action to="/submit-research" variant="ink" size="lg">
                Submit Research
              </Action>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
