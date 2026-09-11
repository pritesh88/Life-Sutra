import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import {
  Action,
  Card,
  Container,
  MetaRow,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { whitePapers } from "@/data/content";

export const Route = createFileRoute("/white-papers")({
  head: () => ({
    meta: [
      { title: "White Papers — Standards, Policy & Frameworks" },
      {
        name: "description",
        content:
          "Life Sutra white papers on research integrity, metadata standards, policy frameworks and evidence rubrics for Indian Knowledge Systems.",
      },
      { property: "og:title", content: "White Papers — Life Sutra" },
      {
        property: "og:description",
        content: "Standards, policy and framework documents for IKS research infrastructure.",
      },
    ],
  }),
  component: WhitePapersPage,
});

function WhitePapersPage() {
  return (
    <>
      <PageHero
        eyebrow="Frameworks & policy"
        title="White Papers"
        lede="Documents that set standards rather than report findings: integrity requirements, metadata crosswalks, evidence rubrics and infrastructure proposals."
        meta={[`${whitePapers.length} documents`, "Free to download", "Open consultation"]}
      />

      <Section>
        <Container>
          <SectionHeading eyebrow="Library" title="Published documents" />
          <ul className="grid gap-5 md:grid-cols-2">
            {whitePapers.map((w) => (
              <Card key={w.id} as="li" className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <Tag tone="saffron">{w.theme}</Tag>
                  <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl leading-snug">{w.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{w.summary}</p>
                <div className="mt-5 flex items-center justify-between border-t border-rule pt-4">
                  <MetaRow items={[w.issuedBy, `${w.pages} pp.`, w.date]} />
                </div>
              </Card>
            ))}
          </ul>
          <div className="mt-12 rounded-md border border-border bg-parchment p-8">
            <h3 className="text-xl">Comment on a draft</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Standards documents are released for a six-week consultation before adoption. Members
              and partner institutions receive drafts directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Action to="/membership" variant="primary" size="sm">
                Join to receive drafts
              </Action>
              <Action to="/methodology" variant="outline" size="sm">
                Methodology framework
              </Action>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
