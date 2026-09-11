import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  Container,
  MetaRow,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { dialogues } from "@/data/content";

export const Route = createFileRoute("/iks-dialogue")({
  head: () => ({
    meta: [
      { title: "IKS Dialogue — Scholarly Commentary & Debate" },
      {
        name: "description",
        content:
          "Commentary, responses, interviews and roundtables debating methods and evidence standards in Indian Knowledge Systems research.",
      },
      { property: "og:title", content: "IKS Dialogue — Life Sutra" },
      {
        property: "og:description",
        content: "Scholarly debate on method, evidence and definition in IKS research.",
      },
    ],
  }),
  component: DialoguePage,
});

function DialoguePage() {
  return (
    <>
      <PageHero
        eyebrow="Discussion forum"
        title="IKS Dialogue"
        lede="A moderated space for argument. Contributors respond to published work, contest method and set out positions that would be out of place in a research article."
        meta={["Editorially moderated", "Signed contributions", "Responses invited"]}
      />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Current thread"
            title="Commentary and responses"
            description="Every entry is attributed. Responses are published alongside the piece they answer."
          />
          <ul className="grid gap-5 lg:grid-cols-2">
            {dialogues.map((d) => (
              <Card key={d.id} as="li" className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="gold">{d.format}</Tag>
                  <MetaRow items={[d.readingTime, d.date]} />
                </div>
                <h3 className="mt-4 text-xl leading-snug">{d.title}</h3>
                <blockquote className="mt-4 border-l-2 border-saffron/60 pl-4 text-sm leading-relaxed text-muted-foreground italic">
                  {d.excerpt}
                </blockquote>
                <div className="mt-5 border-t border-rule pt-4">
                  <p className="text-sm font-semibold">{d.contributor}</p>
                  <p className="text-xs text-muted-foreground">{d.role}</p>
                </div>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
