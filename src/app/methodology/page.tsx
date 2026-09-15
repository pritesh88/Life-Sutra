import {
  Action,
  Card,
  Container,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { methodStages } from "@/data/content";
import { claimClasses, methodologyMeta } from "@/data/pages";

export const metadata = methodologyMeta;

export default function MethodologyPage() {
  return (
    <>
      <PageHero
        eyebrow="Standards"
        title="Methodology"
        lede="A single protocol applies across domains. It separates what a text says from what happened, what reproduces and what we interpret — and asks for the evidence appropriate to each."
        meta={["Six stages", "Four claim classes", "Version 2.1 — 2026"]}
      />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Claim classification"
            title="Four classes of knowledge claim"
            description="Authors classify their claim before evidence is gathered. Reviewers assess against the class declared."
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {claimClasses.map((c) => (
              <Card key={c.name} as="li" className="p-5">
                <Tag tone="gold">{c.name}</Tag>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="parchment">
        <Container>
          <SectionHeading
            eyebrow="Protocol"
            title="Six stages from source to synthesis"
            action={
              <Action to="/submit-research" variant="outline" size="sm">
                Submission guide
              </Action>
            }
          />
          <ol className="grid gap-5 lg:grid-cols-2">
            {methodStages.map((s) => (
              <Card key={s.id} as="li" className="p-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-3xl text-primary">{s.stage}</span>
                  <h3 className="text-xl leading-snug">{s.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2 border-t border-rule pt-4">
                  {s.outputs.map((o) => (
                    <li key={o}>
                      <Tag>{o}</Tag>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
