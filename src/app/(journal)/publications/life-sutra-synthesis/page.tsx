import { journalPath } from "@/lib/routes";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { EditorialBoardCard } from "@/components/site/EditorialBoardCard";
import { PaperCard } from "@/components/site/PaperCard";
import {
  Action,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { editorialBoard, editorialPrinciples, papers } from "@/data/content";
import { homeContent, homeMeta } from "@/data/pages";
import { ASSETS } from "@/lib/site";
import GlobalAdvisory from "@/components/site/GlobalAdvisory";
import ChiefPatron from "@/components/site/ChiefPatron";
import JournalParticulars from "@/components/site/JournalParticulars";
import JournalAbout from "@/components/site/JournalAbout";

export const metadata = homeMeta;

export default function HomePage() {
  const latest = papers.slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-parchment">
        <div className="jaali pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
        <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <p className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Life Sutra Synthesis
            </p>
            <Eyebrow className="mt-3">
              Global Research &amp; Knowledge Platform for Indian Knowledge Systems (IKS)
            </Eyebrow>
            <h1 className="mt-5 text-2xl leading-[1.15] sm:text-4xl">
              Discover. Research.
              <span className="block text-primary">Synthesize. Connect.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
              Life Sutra Synthesis is a scholarly research publication for Indian Knowledge Systems
              and contemporary interdisciplinary research. It connects studies, knowledge claims,
              methodology and researchers so that scattered work becomes a shared body of evidence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Action to={journalPath("/research")} variant="primary" size="lg">
                Explore Research Publications <ArrowRight className="size-4" />
              </Action>
              <Action to={journalPath("/iks-dialogue")} variant="outline" size="lg">
                Explore IKS Knowledge
              </Action>
              <Action to={journalPath("/research-opportunities")} variant="ghost" size="lg">
                Find Research Opportunities
              </Action>
            </div>
          </div>

          <figure className="relative">
            <Image
              src={ASSETS.hero}
              alt="Scholars reviewing research materials in an academic library setting"
              width={1600}
              height={1104}
              priority
              className="h-auto w-full rounded-md border border-border object-cover shadow-raised"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </figure>
        </Container>
      </section>

      <div className="border-y border-gold/30 bg-earth text-earth-foreground">
        <Container className="flex h-20 flex-col items-center justify-center gap-1.5 text-center sm:flex-row sm:gap-4">
          <span className="font-mono text-[0.7rem] tracking-[0.2em] text-earth-foreground/55 uppercase">
            Journal identifier
          </span>
          <span className="hidden h-4 w-px bg-earth-foreground/25 sm:block" aria-hidden="true" />
          <span className="text-base font-semibold tracking-[0.1em] text-gold uppercase sm:text-lg">
            ISSN: To Be Issued
          </span>
        </Container>
      </div>

      <JournalParticulars />

      <JournalAbout />

      <ChiefPatron />

      <Section id="editorial-board" tone="parchment" className="scroll-mt-24">
        <Container>
          <SectionHeading
            eyebrow="Governance"
            title="Editorial Board"
            description="The scholars and practitioners who set editorial policy and review standards for Life Sutra Synthesis."
          />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {editorialBoard.map((member) => (
              <EditorialBoardCard key={member.id} member={member} />
            ))}
          </ul>
        </Container>
      </Section>

      <GlobalAdvisory />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="What is Life Sutra Synthesis?"
            title="More than a journal — a research ecosystem"
            description="Life Sutra Synthesis publishes peer-reviewed scholarship, and also builds the connective infrastructure around it: the claims being studied, the methods used, the people doing the work, and the synthesis that follows."
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
            eyebrow="Latest submissions"
            title="Latest research"
            description="Double-anonymous peer-reviewed studies across textual, field and experimental methods."
            action={
              <Action to={journalPath("/research")} variant="outline" size="sm">
                Explore Research Publications
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
            eyebrow="The Life Sutra Synthesis knowledge model"
            title="Knowledge Claim → Evidence → Research → Synthesis"
            description="A knowledge claim carried by a text or a living practice can be documented on its own terms, then examined against the forms of evidence that are actually appropriate to it — and connected to the studies that already speak to it."
            action={
              <Action to={journalPath("/iks-dialogue")} variant="outline" size="sm">
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
        <Container className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>Research methodology</Eyebrow>
            <blockquote className="mt-5 border-l-2 border-primary pl-5 font-display text-2xl leading-snug text-ink sm:text-[1.75rem]">
              "Method should respond to the nature of the knowledge claim."
            </blockquote>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Life Sutra Synthesis does not propose a single universal methodology. It works with a
              plural, pramāṇa-sensitive approach: a textual claim, a historical claim and a clinical
              claim call for different evidence and different designs. What is asked of every study
              is that the reasoning behind the chosen method is stated openly.
            </p>
            <div className="mt-8">
              <Action to={journalPath("/methodology")} variant="outline">
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
              The pathway Life Sutra Synthesis is building, from an initial idea through to
              synthesis. Stages beyond publication are being developed.
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
            <Action to={journalPath("/research-opportunities")} variant="onEarth" size="sm">
              Explore Research Incubator
            </Action>
            <p className="text-xs text-earth-foreground/60">
              Incubator tooling and opportunity listings are in development.
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="parchment">
        <Container>
          <SectionHeading
            eyebrow="In development"
            title="Life Sutra Synthesis Research Observatory"
            description="A long-term effort to map the IKS research ecosystem — who is working on what, where, and how the studies relate. The observatory is still being built."
            action={
              <Action to={journalPath("/research-impact")} variant="outline" size="sm">
                Explore Observatory
              </Action>
            }
          />
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Life Sutra Synthesis Journal"
            title="Open access · Peer reviewed · Interdisciplinary"
            description="The publishing standards the journal holds itself to."
            action={
              <Action to={journalPath("/research")} variant="outline" size="sm">
                Explore Research Publications
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

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>About</Eyebrow>
            <h2 className="mt-3 text-2xl leading-snug sm:text-3xl">
              Global Research &amp; Knowledge Platform for Indian Knowledge Systems (IKS)
            </h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-muted-foreground">
              Life Sutra Synthesis is an academic e-journal and future research platform focused on
              documenting, publishing, connecting and synthesizing research related to Indian
              Knowledge Systems. The initial website establishes a professional, credible academic
              identity, and will evolve into a fully dynamic research platform.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/assets/gallery-heritage.jpg"
              alt="Carved stone pillars of an ancient Indian temple, reflecting the heritage Indian Knowledge Systems draw on"
              width={600}
              height={800}
              className="row-span-2 h-full w-full rounded-md border border-border object-cover shadow-card"
            />
            <Image
              src="/assets/gallery-manuscripts.jpg"
              alt="Archival manuscript pages, representing textual sources for research"
              width={600}
              height={500}
              className="h-full w-full rounded-md border border-border object-cover shadow-card"
            />
            <Image
              src="/assets/gallery-collaboration.jpg"
              alt="Researchers collaborating around a table with laptops"
              width={600}
              height={500}
              className="h-full w-full rounded-md border border-border object-cover shadow-card"
            />
          </div>
        </Container>
      </Section>
      <Section tone="parchment">
        <Container>
          <div className="rounded-md border border-border bg-card p-8 text-center sm:p-12">
            <Eyebrow className="justify-center">The Life Sutra Synthesis pathway</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-3xl text-2xl leading-snug sm:text-3xl">
              From knowledge claim → research → evidence → synthesis → new knowledge
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Read what the field has established, or bring the question you are working on.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Action to={journalPath("/research")} variant="primary" size="lg">
                Explore Research Publications
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
