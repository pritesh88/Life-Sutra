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
import { synthesisThreads } from "@/data/content";
import { impactContent, impactMeta } from "@/data/pages";

export const metadata = impactMeta;

export default function ImpactPage() {
  return (
    <>
      <PageHero
        eyebrow="Observatory"
        title="Research Impact"
        lede="Impact here means whether evidence accumulates — not download counts. The observatory is being built to measure coverage, convergence and method adoption across the field."
        meta={["Indicators in development", "Open dataset for members"]}
      />

      <Section>
        <Container>
          <SectionHeading eyebrow="Indicators" title="Current measures" />
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {impactContent.indicators.map((i) => (
              <Stat key={i.label} label={i.label} value={i.value} />
            ))}
          </dl>
          <Ornament className="my-14" />
          <SectionHeading
            eyebrow="Synthesis"
            title="Active threads"
            description="Where multiple studies are converging on a shared question."
            action={
              <Action to="/research" variant="outline" size="sm">
                Underlying papers
              </Action>
            }
          />
          <ul className="grid gap-4 md:grid-cols-3">
            {synthesisThreads.map((t) => (
              <Card key={t.title} as="li" className="p-6">
                <span className="font-mono text-xs text-primary">{t.linked}</span>
                <h3 className="mt-3 text-lg leading-snug">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="earth">
        <Container>
          <p className="eyebrow text-earth-foreground/65">In development</p>
          <h2 className="mt-3 max-w-2xl text-2xl text-earth-foreground sm:text-3xl">
            What the observatory will measure
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {impactContent.observatory.map((o) => (
              <li
                key={o.title}
                className="rounded-md border border-earth-foreground/18 bg-earth-foreground/[0.06] p-6"
              >
                <h3 className="text-lg text-earth-foreground">{o.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-earth-foreground/75">{o.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
