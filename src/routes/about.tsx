import { createFileRoute } from "@tanstack/react-router";
import {
  Action,
  Card,
  Container,
  Ornament,
  PageHero,
  Section,
  SectionHeading,
  Stat,
} from "@/components/site/primitives";
import { editorialPrinciples, journalStats } from "@/data/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Life Sutra — Mission, Standards & Governance" },
      {
        name: "description",
        content:
          "Life Sutra's mission, editorial standards, review process and governance for Indian Knowledge Systems research.",
      },
      { property: "og:title", content: "About Life Sutra" },
      {
        property: "og:description",
        content: "Mission, editorial standards and governance of the Life Sutra research platform.",
      },
    ],
  }),
  component: AboutPage,
});

const roadmap = [
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
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the platform"
        title="Building credible research infrastructure for Indian Knowledge Systems"
        lede="Life Sutra exists because the study of Indian intellectual traditions has abundant sources and scattered scholarship. We publish rigorous research and, over time, connect it into an ecosystem that can be searched, synthesised and measured."
        meta={["Founded 2021", "Quarterly", "ISSN 2947-4412", "Double-anonymous review"]}
      />

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <SectionHeading eyebrow="Mission" title="Scholarship first, tradition as source" />
            <div className="grid gap-5 text-[0.98rem] leading-relaxed text-muted-foreground">
              <p>
                Indian Knowledge Systems research sits between disciplines: philology, history,
                anthropology, clinical science, mathematics, architecture and policy. Life Sutra is
                built for that overlap. We accept work from any of these traditions provided the
                knowledge claim is stated precisely and matched to an appropriate evidence standard.
              </p>
              <p>
                We are a secular academic publication. Sources may be classical, devotional or oral;
                the argument built on them must meet contemporary scholarly standards. Reverence is
                not evidence, and neither is dismissal.
              </p>
              <p>
                Our long-term objective is infrastructure rather than volume: shared vocabularies,
                interoperable metadata, transparent review and a synthesis layer that lets findings
                accumulate instead of dispersing across unconnected journals.
              </p>
            </div>
          </div>
          <aside className="rounded-md border border-border bg-parchment p-7">
            <p className="eyebrow">At a glance</p>
            <dl className="mt-6 grid gap-6">
              {journalStats.map((s) => (
                <Stat key={s.label} label={s.label} value={s.value} />
              ))}
            </dl>
            <Ornament className="my-7" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Editorial council of 18 members across 9 countries. All review decisions are recorded
              with a public summary of their basis.
            </p>
          </aside>
        </Container>
      </Section>

      <Section tone="parchment">
        <Container>
          <SectionHeading
            eyebrow="Editorial standards"
            title="Four principles that govern every decision"
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {editorialPrinciples.map((p) => (
              <Card key={p.title} as="li" className="p-6">
                <h3 className="text-lg">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Direction"
            title="From journal to research ecosystem"
            description="Each stage is additive: the journal remains the foundation as the connected layers are built on top of it."
            action={
              <Action to="/research-impact" variant="outline" size="sm">
                See the observatory
              </Action>
            }
          />
          <ol className="grid gap-4 md:grid-cols-3">
            {roadmap.map((r) => (
              <Card key={r.phase} as="li" className="p-6">
                <span className="font-mono text-xs tracking-widest text-primary uppercase">
                  {r.phase}
                </span>
                <h3 className="mt-3 text-lg leading-snug">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </Card>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
